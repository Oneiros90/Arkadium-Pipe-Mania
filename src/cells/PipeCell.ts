import { Cell } from '../core/Cell';
import { Position } from '../core/types';
import { Pipe } from '../core/Pipe';
import type { VisualConfig } from '@/config/schemas';

/**
 * Represents a cell containing a pipe segment.
 */
export class PipeCell extends Cell {
  readonly type = 'pipe';
  readonly isEmpty = false;
  readonly isBlocked = false;
  readonly isStart = false;

  constructor(position: Position, pipe: Pipe) {
    super(position);
    this.pipe = pipe;
  }

  canPlacePipe(): boolean {
    return this.waterFlows.length === 0;
  }

  getBackgroundTexture(config: VisualConfig): string {
    return config.assets.pipes.background;
  }
}
