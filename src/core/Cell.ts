import { Position, Direction } from './types';
import { Pipe } from './Pipe';

interface WaterFlow {
  level: number;
  entryDirection: Direction;
}

/**
 * Abstract base class representing a single cell in the grid.
 * Handles water flow state and pipe containment.
 */
export abstract class Cell {
  public waterFlows: WaterFlow[] = [];
  public usedDirections: Set<Direction> = new Set();
  public pipe: Pipe | null = null;
  public hasWater: boolean = false;

  constructor(
    public readonly position: Position
  ) { }

  abstract readonly type: string;
  abstract readonly isEmpty: boolean;
  abstract readonly isBlocked: boolean;
  abstract readonly isStart: boolean;
  abstract canPlacePipe(): boolean;

  hasPipe(): boolean {
    return this.pipe !== null;
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
