import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';

/**
 * A cross pipe segment connecting all four directions.
 * Water flows straight through without turning.
 */
export class CrossPipe extends Pipe {
  readonly type = 'cross';

  constructor() {
    super(
      0,
      [[Direction.North, Direction.East, Direction.South, Direction.West]]
    );
  }

  getExitDirection(entryDirection: Direction): Direction | null {
    const connections = this.getActiveConnections();

    if (!connections.includes(entryDirection)) {
      return null;
    }

    switch (entryDirection) {
      case Direction.North:
        return Direction.South;
      case Direction.South:
        return Direction.North;
      case Direction.East:
        return Direction.West;
      case Direction.West:
        return Direction.East;
    }
  }
}
