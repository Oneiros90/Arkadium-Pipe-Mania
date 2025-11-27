import { Cell } from '../core/Cell';
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
}
