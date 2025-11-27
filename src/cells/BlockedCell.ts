import { Cell } from '../core/Cell';
import type { VisualConfig } from '@/config/schemas';
import { Position } from '../core/types';

/**
 * Represents a blocked cell (obstacle) where no pipes can be placed.
 */
export class BlockedCell extends Cell {
  readonly type = 'blocked';
  readonly isEmpty = false;
  readonly isBlocked = true;
  readonly isStart = false;

  constructor(position: Position) {
    super(position);
  }

  canPlacePipe(): boolean {
    return false;
  }

  getBackgroundTexture(config: VisualConfig): string {
    return config.assets.backgrounds.blocked;
  }
}
