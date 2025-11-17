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
  private path: Cell[] = [];
  private currentIndex: number = 0;
  private flowTimer: number = 0;
  private requiredPathLength: number = 0;

  constructor(
    private validator: PathValidator,
    private config: GameConfig,
    private onCellFilled: (row: number, col: number) => void,
    private onGameEnd: (won: boolean, pathLength: number) => void
  ) {}

  start(startPosition: Position, requiredLength: number): void {
    this.requiredPathLength = requiredLength;
    this.path = this.validator.findConnectedPath(startPosition);
    this.currentIndex = 0;
    this.flowTimer = 0;
    this.state = FlowState.Flowing;

    logger.info('FlowSystem', 'Water flow started', {
      requiredLength,
      pathLength: this.path.length
    });
  }

  update(deltaTime: number): void {
    if (this.state !== FlowState.Flowing) {
      return;
    }

    this.flowTimer += deltaTime;

    if (this.flowTimer >= this.config.gameplay.flowSpeed) {
      this.flowTimer = 0;
      this.advanceFlow();
    }
  }

  private advanceFlow(): void {
    if (this.currentIndex >= this.path.length) {
      this.checkEndCondition();
      return;
    }

    const cell = this.path[this.currentIndex];
    cell.fillWithWater();
    this.onCellFilled(cell.position.row, cell.position.col);

    this.currentIndex++;

    if (this.currentIndex >= this.path.length) {
      this.checkEndCondition();
    }
  }

  private checkEndCondition(): void {
    const actualLength = this.path.length - 1;
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
    this.path = [];
    this.currentIndex = 0;
    this.flowTimer = 0;
  }

  isActive(): boolean {
    return this.state === FlowState.Flowing;
  }
}
