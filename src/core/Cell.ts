import { CellType, Position, Direction } from './types';
import { Pipe } from './Pipe';

interface WaterFlow {
  level: number;
  entryDirection: Direction;
}

export class Cell {
  public waterFlows: WaterFlow[] = [];
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
    if (this.waterFlows.length > 0) {
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
    this.waterFlows = [];
    this.usedDirections.clear();
  }

  fillWithWater(): void {
    this.hasWater = true;
    this.waterFlows.forEach(flow => flow.level = 1);
  }

  setWaterLevel(level: number, entryDirection: Direction): void {
    const clampedLevel = Math.max(0, Math.min(1, level));
    const existingFlow = this.waterFlows.find(f => f.entryDirection === entryDirection);
    
    if (existingFlow) {
      existingFlow.level = clampedLevel;
    } else {
      this.waterFlows.push({ level: clampedLevel, entryDirection });
    }
    
    this.hasWater = this.waterFlows.some(f => f.level > 0);
  }

  getWaterFlow(entryDirection: Direction): WaterFlow | undefined {
    return this.waterFlows.find(f => f.entryDirection === entryDirection);
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
