import { CellType, Position } from './types';
import { Pipe } from './Pipe';

export class Cell {
  constructor(
    public readonly position: Position,
    public type: CellType = CellType.Empty,
    public pipe: Pipe | null = null,
    public hasWater: boolean = false
  ) {}

  isEmpty(): boolean {
    return this.type === CellType.Empty;
  }

  isBlocked(): boolean {
    return this.type === CellType.Blocked;
  }

  hasPipe(): boolean {
    return this.type === CellType.Pipe && this.pipe !== null;
  }

  isStart(): boolean {
    return this.type === CellType.Start;
  }

  canPlacePipe(): boolean {
    return this.type === CellType.Empty || this.type === CellType.Pipe;
  }

  placePipe(pipe: Pipe): void {
    if (!this.canPlacePipe()) {
      throw new Error(`Cannot place pipe at blocked or start cell`);
    }
    this.pipe = pipe;
    this.type = CellType.Pipe;
  }

  clearPipe(): void {
    this.pipe = null;
    this.type = CellType.Empty;
    this.hasWater = false;
  }

  fillWithWater(): void {
    this.hasWater = true;
  }
}
