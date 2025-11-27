import { Cell } from '@/core/Cell';
import { Position, Direction } from '@/core/types';
import { PathValidator } from './PathValidator';
import { GameConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

export enum FlowState {
  Idle = 'idle',
  Flowing = 'flowing',
  End = 'end'
}

/**
 * Manages the water flow logic, including progress updates and cell transitions.
 */
export class FlowSystem {
  private state: FlowState = FlowState.Idle;
  private currentCell: Cell | null = null;
  private currentCellProgress: number = 0;
  private currentEntryDirection: Direction | null = null;
  private completedCells: number = 0;

  constructor(
    private validator: PathValidator,
    private config: GameConfig,
    private onCellUpdate: (row: number, col: number) => void,
    private onGameEnd: (pathLength: number) => void
  ) { }

  start(startPosition: Position): void {
    this.completedCells = 0;
    this.state = FlowState.Flowing;
    this.currentCell = this.validator.getStartCell(startPosition);
    this.advanceToNextCell();

    logger.info('FlowSystem', 'Water flow started', {
      startPosition
    });
  }

  update(deltaTime: number): void {
    if (this.state !== FlowState.Flowing || !this.currentCell || !this.currentEntryDirection) {
      return;
    }

    const cellsPerSecond = this.config.gameplay.flowSpeed;
    this.currentCellProgress += deltaTime * cellsPerSecond;

    this.currentCell.setWaterLevel(this.currentCellProgress, this.currentEntryDirection);
    this.onCellUpdate(this.currentCell.position.row, this.currentCell.position.col);

    if (this.currentCellProgress >= 1) {
      this.advanceToNextCell();
    }
  }

  private advanceToNextCell(): void {
    if (!this.currentCell) {
      this.handleFlowEnd();
      return;
    }

    if (this.currentCell.hasPipe() && this.currentEntryDirection) {
      this.currentCell.fillWithWater();
      this.currentCell.markDirectionUsed(this.currentEntryDirection);
      const exitDir = this.currentCell.pipe!.getExitDirection(this.currentEntryDirection);
      if (exitDir) {
        this.currentCell.markDirectionUsed(exitDir);
      }
    }

    const next = this.validator.getNextCell(this.currentCell.position);
    if (!next) {
      this.handleFlowEnd();
      return;
    }

    this.currentCell = next.cell;
    this.currentEntryDirection = next.entryDirection;
    this.currentCellProgress = 0;
    this.completedCells++;
  }

  private handleFlowEnd(): void {
    this.state = FlowState.End;
    logger.info('FlowSystem', 'Flow ended', { completedCells: this.completedCells });
    this.onGameEnd(this.completedCells);
  }

  getState(): FlowState {
    return this.state;
  }

  reset(): void {
    this.state = FlowState.Idle;
    this.currentCell = null;
    this.currentEntryDirection = null;
    this.currentCellProgress = 0;
    this.completedCells = 0;
  }

  isActive(): boolean {
    return this.state === FlowState.Flowing;
  }
}
