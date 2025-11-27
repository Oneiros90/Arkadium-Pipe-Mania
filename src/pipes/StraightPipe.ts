import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';

export class StraightPipe extends Pipe {
    constructor(rotation: 0 | 90 = 0) {
        super(
            rotation,
            [
                [Direction.North, Direction.South],
                [Direction.East, Direction.West]
            ]
        );
    }

    getTypeName(): string {
        return 'straight';
    }
}
