import { Cell } from '../core/Cell';
import { Position } from '../core/types';

/**
 * Represents the starting cell of the water flow.
 */
export class StartCell extends Cell {
  readonly type = 'start';
  readonly isEmpty = false;
  readonly isBlocked = false;
  readonly isStart = true;

  constructor(position: Position) {
    super(position);
  }

  canPlacePipe(): boolean {
    return false;
  }
}
