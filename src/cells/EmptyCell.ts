import { Cell } from '../core/Cell';
import { Position } from '../core/types';

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
}
