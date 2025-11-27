import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';

/**
 * A straight pipe segment connecting opposite directions (North-South or East-West).
 */
export class StraightPipe extends Pipe {
  readonly type = 'straight';

  constructor(rotation: 0 | 90 = 0) {
    super(
      rotation,
      [
        [Direction.North, Direction.South],
        [Direction.East, Direction.West]
      ]
    );
  }
}
