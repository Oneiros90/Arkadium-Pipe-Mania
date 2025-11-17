import { Grid } from '@/core/Grid';
import { Cell } from '@/core/Cell';
import { Position, Direction } from '@/core/types';
import { logger } from '@/utils/Logger';

export class PathValidator {
  constructor(private grid: Grid) {}

  isValidConnection(from: Cell, to: Cell, direction: Direction): boolean {
    if (!from.hasPipe() || !to.hasPipe()) {
      return false;
    }

    const fromPipe = from.pipe!;
    const toPipe = to.pipe!;

    const oppositeDirection = this.grid.getOppositeDirection(direction);

    return (
      fromPipe.hasConnection(direction) &&
      toPipe.hasConnection(oppositeDirection)
    );
  }

  findConnectedPath(start: Position): Cell[] {
    const path: Cell[] = [];
    const visited = new Set<string>();
    
    const startCell = this.grid.getCell(start);
    if (!startCell) {
      return path;
    }

    let current: Cell | null = startCell;
    let lastDirection: Direction | null = null;

    while (current) {
      const key = `${current.position.row}-${current.position.col}`;
      
      if (visited.has(key)) {
        break;
      }

      visited.add(key);
      path.push(current);

      if (!current.hasPipe() && !current.isStart()) {
        break;
      }

      const next = this.findNextCell(current, lastDirection);
      if (!next) {
        break;
      }

      lastDirection = next.direction;
      current = next.cell;
    }

    logger.debug('PathValidator', `Found path of length ${path.length}`, {
      startPosition: start
    });

    return path;
  }

  private findNextCell(
    current: Cell,
    excludeDirection: Direction | null
  ): { cell: Cell; direction: Direction } | null {
    const directions = [Direction.North, Direction.East, Direction.South, Direction.West];
    
    for (const direction of directions) {
      if (excludeDirection && direction === this.grid.getOppositeDirection(excludeDirection)) {
        continue;
      }

      const neighbor = this.grid.getNeighbor(current.position, direction);
      if (!neighbor) {
        continue;
      }

      if (current.isStart()) {
        if (neighbor.hasPipe()) {
          const oppositeDir = this.grid.getOppositeDirection(direction);
          if (neighbor.pipe!.hasConnection(oppositeDir)) {
            return { cell: neighbor, direction };
          }
        }
      } else if (current.hasPipe()) {
        const exitDir = current.pipe!.getExitDirection(excludeDirection!);
        if (exitDir === direction) {
          if (this.isValidConnection(current, neighbor, direction)) {
            return { cell: neighbor, direction };
          }
        }
      }
    }

    return null;
  }

  getPathLength(start: Position): number {
    return this.findConnectedPath(start).length;
  }

  getStartCell(start: Position): Cell | null {
    return this.grid.getCell(start);
  }

  getNextCell(currentPosition: Position): { cell: Cell; entryDirection: Direction } | null {
    const current = this.grid.getCell(currentPosition);
    if (!current) {
      return null;
    }

    const directions = [Direction.North, Direction.East, Direction.South, Direction.West];
    
    for (const direction of directions) {
      const neighbor = this.grid.getNeighbor(currentPosition, direction);
      if (!neighbor) {
        continue;
      }

      const oppositeDir = this.grid.getOppositeDirection(direction);

      if (neighbor.hasWater && neighbor.waterFlows.length > 0 && !neighbor.canEnterFromDirection(oppositeDir)) {
        const isFullyFilled = neighbor.waterFlows.every(flow => flow.level >= 1);
        if (isFullyFilled) {
          continue;
        }
      }

      if (current.isStart()) {
        if (neighbor.hasPipe() && neighbor.canEnterFromDirection(oppositeDir)) {
          if (neighbor.pipe!.hasConnection(oppositeDir)) {
            return { cell: neighbor, entryDirection: oppositeDir };
          }
        }
      } else if (current.hasPipe() && current.waterFlows.length > 0) {
        const lastFlow = current.waterFlows[current.waterFlows.length - 1];
        const exitDir = current.pipe!.getExitDirection(lastFlow.entryDirection);
        if (exitDir === direction) {
          if (neighbor.hasPipe() && neighbor.canEnterFromDirection(oppositeDir)) {
            if (neighbor.pipe!.hasConnection(oppositeDir)) {
              return { cell: neighbor, entryDirection: oppositeDir };
            }
          }
        }
      }
    }

    return null;
  }
}
