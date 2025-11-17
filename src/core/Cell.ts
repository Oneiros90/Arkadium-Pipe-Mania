import { CellType, Position, Direction } from './types';
import { Pipe } from './Pipe';

export class Cell {
  public waterLevel: number = 0;
  public waterEntryDirection: Direction | null = null;
  public usedDirections: Set<Direction> = new Set();

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
    if (this.waterLevel > 0) {
      return false;
    }
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
    this.waterLevel = 0;
    this.waterEntryDirection = null;
    this.usedDirections.clear();
  }

  fillWithWater(): void {
    this.hasWater = true;
    this.waterLevel = 1;
  }

  setWaterLevel(level: number, entryDirection?: Direction): void {
    this.waterLevel = Math.max(0, Math.min(1, level));
    this.hasWater = this.waterLevel > 0;
    if (entryDirection && !this.waterEntryDirection) {
      this.waterEntryDirection = entryDirection;
    }
  }

  canEnterFromDirection(direction: Direction): boolean {
    if (!this.hasPipe() || !this.pipe!.hasConnection(direction)) {
      return false;
    }
    return !this.usedDirections.has(direction);
  }

  markDirectionUsed(direction: Direction): void {
    this.usedDirections.add(direction);
  }
}
