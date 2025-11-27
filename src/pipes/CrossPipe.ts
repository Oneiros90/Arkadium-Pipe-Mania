import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';
import { PipeRegistry } from '../core/PipeRegistry';
import { Random } from '@/utils/Random';
import type { VisualConfig } from '@/config/schemas';

/**
 * A cross pipe segment connecting all four directions.
 * Water flows straight through without turning.
 */
export class CrossPipe extends Pipe {
  static readonly TYPE = 'cross';
  readonly type = CrossPipe.TYPE;

  constructor() {
    super(
      0,
      [[Direction.North, Direction.East, Direction.South, Direction.West]]
    );
  }

  getExitDirection(entryDirection: Direction): Direction | null {
    const connections = this.getActiveConnections();

    if (!connections.includes(entryDirection)) {
      return null;
    }

    switch (entryDirection) {
      case Direction.North:
        return Direction.South;
      case Direction.South:
        return Direction.North;
      case Direction.East:
        return Direction.West;
      case Direction.West:
        return Direction.East;
    }
  }

  static createRandom(_random: Random): CrossPipe {
    return new CrossPipe();
  }

  getTexturePath(config: VisualConfig): string {
    return config.assets.pipes.cross;
  }

  getWaterPathFunction(
    entryDir: Direction,
    exitDir: Direction | null,
    cellSize: number,
    _waterConfig: { widthRatio: number; curveStrength: number }
  ): (t: number) => { x: number; y: number } {
    const center = cellSize / 2;

    const getEdgePoint = (dir: Direction): { x: number; y: number } => {
      switch (dir) {
        case 'N': return { x: center, y: 0 };
        case 'S': return { x: center, y: cellSize };
        case 'E': return { x: cellSize, y: center };
        case 'W': return { x: 0, y: center };
        default: return { x: center, y: center };
      }
    };

    const entryEdge = getEdgePoint(entryDir);

    if (!exitDir) {
      // Water hasn't reached exit yet, just go from entry to center
      return (t: number) => ({
        x: entryEdge.x + (center - entryEdge.x) * t,
        y: entryEdge.y + (center - entryEdge.y) * t
      });
    }

    const exitEdge = getEdgePoint(exitDir);

    // Linear interpolation from entry to exit (straight through)
    return (t: number) => ({
      x: entryEdge.x + (exitEdge.x - entryEdge.x) * t,
      y: entryEdge.y + (exitEdge.y - entryEdge.y) * t
    });
  }
}

PipeRegistry.register(CrossPipe.TYPE, CrossPipe);
