import { Cell } from '@/core/Cell';
import { Position } from '@/core/types';
import { PathValidator } from './PathValidator';
import { GameConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

export enum FlowState {
  Idle = 'idle',
  Flowing = 'flowing',
  Complete = 'complete',
  Failed = 'failed'
}

export class FlowSystem {
  private state: FlowState = FlowState.Idle;
  private currentCell: Cell | null = null;
  private currentCellProgress: number = 0;
  private requiredPathLength: number = 0;
  private completedCells: number = 0;

  constructor(
    private validator: PathValidator,
    private config: GameConfig,
    private onCellUpdate: (row: number, col: number) => void,
    private onGameEnd: (won: boolean, pathLength: number) => void
  ) {}

  start(startPosition: Position, requiredLength: number): void {
    this.requiredPathLength = requiredLength;
    this.currentCell = this.validator.getStartCell(startPosition);
    this.currentCellProgress = 0;
    this.completedCells = 0;
    this.state = FlowState.Flowing;

    if (this.currentCell) {
      this.currentCell.setWaterLevel(0);
    }

    logger.info('FlowSystem', 'Water flow started', {
      requiredLength,
      startPosition
    });
  }

  update(deltaTime: number): void {
    if (this.state !== FlowState.Flowing || !this.currentCell) {
      return;
    }

    const cellsPerSecond = this.config.gameplay.flowSpeed;
    this.currentCellProgress += deltaTime * cellsPerSecond;

    this.currentCell.setWaterLevel(this.currentCellProgress, this.currentCell.waterEntryDirection || undefined);
    this.onCellUpdate(this.currentCell.position.row, this.currentCell.position.col);

    if (this.currentCellProgress >= 1) {
      this.advanceToNextCell();
    }
  }

  private advanceToNextCell(): void {
    if (!this.currentCell) {
      return;
    }

    this.currentCell.fillWithWater();
    
    if (this.currentCell.waterEntryDirection && this.currentCell.hasPipe()) {
      this.currentCell.markDirectionUsed(this.currentCell.waterEntryDirection);
      const exitDir = this.currentCell.pipe!.getExitDirection(this.currentCell.waterEntryDirection);
      if (exitDir) {
        this.currentCell.markDirectionUsed(exitDir);
      }
    }
    
    this.completedCells++;

    const next = this.validator.getNextCell(this.currentCell.position);

    if (!next) {
      this.handleFlowEnd();
      return;
    }

    this.currentCell = next.cell;
    this.currentCellProgress = 0;
    this.currentCell.setWaterLevel(0, next.entryDirection);
  }

  private handleFlowEnd(): void {
    const actualLength = this.completedCells;
    const won = actualLength >= this.requiredPathLength;

    this.state = won ? FlowState.Complete : FlowState.Failed;

    logger.info('FlowSystem', `Game ended: ${won ? 'WON' : 'LOST'}`, {
      requiredLength: this.requiredPathLength,
      actualLength
    });

    this.onGameEnd(won, actualLength);
  }

  getState(): FlowState {
    return this.state;
  }

  reset(): void {
    this.state = FlowState.Idle;
    this.currentCell = null;
    this.currentCellProgress = 0;
    this.completedCells = 0;
  }

  isActive(): boolean {
    return this.state === FlowState.Flowing;
  }
}
