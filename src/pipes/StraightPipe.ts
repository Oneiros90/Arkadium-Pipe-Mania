import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';
import { PipeRegistry } from '../core/PipeRegistry';
import { Random } from '@/utils/Random';
import type { VisualConfig } from '@/config/schemas';

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

  getTexturePath(config: VisualConfig): string {
    return config.assets.pipes.straight;
  }

  getWaterPathFunction(
    entryDir: Direction,
    exitDir: Direction | null,
    cellSize: number,
    _waterConfig: { widthRatio: number; curveStrength: number }
  ): (t: number) => { x: number; y: number } {
    const center = cellSize / 2;

    const getEdgePoint = (dir: Direction): { x: number; y: number } => {
      switch (dir) {
        case 'N': return { x: center, y: 0 };
        case 'S': return { x: center, y: cellSize };
        case 'E': return { x: cellSize, y: center };
        case 'W': return { x: 0, y: center };
        default: return { x: center, y: center };
      }
    };

    const entryEdge = getEdgePoint(entryDir);

    if (!exitDir) {
      // Water hasn't reached exit yet, just go from entry to center
      return (t: number) => ({
        x: entryEdge.x + (center - entryEdge.x) * t,
        y: entryEdge.y + (center - entryEdge.y) * t
      });
    }

    const exitEdge = getEdgePoint(exitDir);

    // Linear interpolation from entry to exit
    return (t: number) => ({
      x: entryEdge.x + (exitEdge.x - entryEdge.x) * t,
      y: entryEdge.y + (exitEdge.y - entryEdge.y) * t
    });
  }
}

PipeRegistry.register(StraightPipe.TYPE, StraightPipe);
