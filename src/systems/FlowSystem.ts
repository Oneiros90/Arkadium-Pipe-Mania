import { Cell } from '@/core/Cell';
import { Position, Direction } from '@/core/types';
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
  private currentEntryDirection: Direction | null = null;
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

    logger.info('FlowSystem', 'Water flow started', {
      requiredLength,
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
    if (!this.currentCell || !this.currentEntryDirection) {
      return;
    }

    this.currentCell.fillWithWater();
    
    if (this.currentCell.hasPipe()) {
      this.currentCell.markDirectionUsed(this.currentEntryDirection);
      const exitDir = this.currentCell.pipe!.getExitDirection(this.currentEntryDirection);
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
    this.currentEntryDirection = next.entryDirection;
    this.currentCellProgress = 0;
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
    this.currentEntryDirection = null;
    this.currentCellProgress = 0;
    this.completedCells = 0;
  }

  isActive(): boolean {
    return this.state === FlowState.Flowing;
  }
}
