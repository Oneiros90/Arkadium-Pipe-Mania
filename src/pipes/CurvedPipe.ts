import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';
import { PipeRegistry } from '../core/PipeRegistry';

/**
 * A curved pipe segment connecting adjacent directions (90-degree turn).
 */
export class CurvedPipe extends Pipe {
  static readonly TYPE = 'curved';
  readonly type = CurvedPipe.TYPE;

  constructor(rotation: 0 | 90 | 180 | 270 = 0) {
    super(
      rotation,
      [
        [Direction.North, Direction.East],
        [Direction.East, Direction.South],
        [Direction.South, Direction.West],
        [Direction.West, Direction.North]
      ]
    );
  }
}

PipeRegistry.register(CurvedPipe.TYPE, CurvedPipe);
