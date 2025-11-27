import { Cell } from '../core/Cell';
import type { VisualConfig } from '@/config/schemas';
import { Position } from '../core/types';

/**
 * Represents an empty cell where pipes can be placed.
 */
export class EmptyCell extends Cell {
  readonly type = 'empty';
  readonly isEmpty = true;
  readonly isBlocked = false;
  readonly isStart = false;

  constructor(position: Position) {
    super(position);
  }

  canPlacePipe(): boolean {
    return this.waterFlows.length === 0;
  }

  getBackgroundTexture(config: VisualConfig): string {
    return config.assets.backgrounds.empty;
  }
}
