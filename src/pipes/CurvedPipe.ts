import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';

export class CurvedPipe extends Pipe {
  readonly type = 'curved';

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
