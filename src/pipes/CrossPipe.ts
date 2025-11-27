import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';

export class CrossPipe extends Pipe {
    constructor() {
        super(
            0,
            [[Direction.North, Direction.East, Direction.South, Direction.West]]
        );
    }

    getTypeName(): string {
        return 'cross';
    }

    // Override to maintain cross-pipe logic (water goes straight through)
    getExitDirection(entryDirection: Direction): Direction | null {
        const connections = this.getActiveConnections();

        if (!connections.includes(entryDirection)) {
            return null;
        }

        // Cross pipe: water exits in opposite direction
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
