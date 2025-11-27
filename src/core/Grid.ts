import { Cell } from './Cell';
import { EmptyCell } from './cells/EmptyCell';
import { BlockedCell } from './cells/BlockedCell';
import { StartCell } from './cells/StartCell';
import { PipeCell } from './cells/PipeCell';
import { Position, Direction } from './types';
import { Pipe } from './Pipe';

export class Grid {
  private cells: Cell[][];

  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    this.cells = this.initializeCells();
  }

  private initializeCells(): Cell[][] {
    const cells: Cell[][] = [];
    for (let row = 0; row < this.height; row++) {
      cells[row] = [];
      for (let col = 0; col < this.width; col++) {
        cells[row][col] = new EmptyCell({ row, col });
      }
    }
    return cells;
  }

  getCell(position: Position): Cell | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return this.cells[position.row][position.col];
  }

  isValidPosition(position: Position): boolean {
    return (
      position.row >= 0 &&
      position.row < this.height &&
      position.col >= 0 &&
      position.col < this.width
    );
  }

  setBlocked(position: Position): void {
    if (!this.isValidPosition(position)) {
      return;
    }
    this.cells[position.row][position.col] = new BlockedCell(position);
  }

  setStart(position: Position): void {
    if (!this.isValidPosition(position)) {
      return;
    }
    this.cells[position.row][position.col] = new StartCell(position);
  }

  placePipe(position: Position, pipe: Pipe): boolean {
    const cell = this.getCell(position);
    if (!cell || !cell.canPlacePipe()) {
      return false;
    }

    const newCell = new PipeCell(position, pipe);
    if (cell.hasWater) {
      newCell.waterFlows = [...cell.waterFlows];
      newCell.usedDirections = new Set(cell.usedDirections);
      newCell.hasWater = cell.hasWater;
    }

    this.cells[position.row][position.col] = newCell;
    return true;
  }

  getNeighbor(position: Position, direction: Direction): Cell | null {
    const offset = this.getDirectionOffset(direction);
    const neighborPos: Position = {
      row: position.row + offset.row,
      col: position.col + offset.col
    };
    return this.getCell(neighborPos);
  }

  private getDirectionOffset(direction: Direction): Position {
    switch (direction) {
      case Direction.North:
        return { row: -1, col: 0 };
      case Direction.South:
        return { row: 1, col: 0 };
      case Direction.East:
        return { row: 0, col: 1 };
      case Direction.West:
        return { row: 0, col: -1 };
    }
  }

  getOppositeDirection(direction: Direction): Direction {
    switch (direction) {
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

  forEachCell(callback: (cell: Cell) => void): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        callback(this.cells[row][col]);
      }
    }
  }

  reset(): void {
    this.cells = this.initializeCells();
  }
}
