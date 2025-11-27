import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';
import { PipeRegistry } from '../core/PipeRegistry';
import { Random } from '@/utils/Random';

/**
 * A straight pipe segment connecting opposite directions (North-South or East-West).
 */
export class StraightPipe extends Pipe {
  static readonly TYPE = 'straight';
  readonly type = StraightPipe.TYPE;

  constructor(rotation: 0 | 90 = 0) {
    super(
      rotation,
      [
        [Direction.North, Direction.South],
        [Direction.East, Direction.West]
      ]
    );
  }
  static createRandom(random: Random): StraightPipe {
    return new StraightPipe(random.choice([0, 90]));
  }
}

PipeRegistry.register(StraightPipe.TYPE, StraightPipe);
