import { Direction, PipeType } from './types';

export class Pipe {
  constructor(
    public readonly type: PipeType,
    public readonly rotation: number,
    public readonly connections: Direction[][]
  ) {}

  getActiveConnections(): Direction[] {
    const rotationIndex = this.rotation / 90;
    return this.connections[rotationIndex % this.connections.length];
  }

  hasConnection(direction: Direction): boolean {
    return this.getActiveConnections().includes(direction);
  }

  static createStraight(rotation: 0 | 90 = 0): Pipe {
    return new Pipe(
      PipeType.Straight,
      rotation,
      [
        [Direction.North, Direction.South],
        [Direction.East, Direction.West]
      ]
    );
  }

  static createCurved(rotation: 0 | 90 | 180 | 270 = 0): Pipe {
    return new Pipe(
      PipeType.Curved,
      rotation,
      [
        [Direction.North, Direction.East],
        [Direction.East, Direction.South],
        [Direction.South, Direction.West],
        [Direction.West, Direction.North]
      ]
    );
  }

  static createCross(): Pipe {
    return new Pipe(
      PipeType.Cross,
      0,
      [[Direction.North, Direction.East, Direction.South, Direction.West]]
    );
  }
}
