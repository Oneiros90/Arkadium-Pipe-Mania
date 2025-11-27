import { Pipe } from '../core/Pipe';
import { Direction } from '../core/types';
import { PipeRegistry } from '../core/PipeRegistry';
import { Random } from '@/utils/Random';
import type { VisualConfig } from '@/config/schemas';

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

  static createRandom(random: Random): CurvedPipe {
    return new CurvedPipe(random.choice([0, 90, 180, 270]));
  }

  getTexturePath(config: VisualConfig): string {
    return config.assets.pipes.curved;
  }

  getWaterPathFunction(
    entryDir: Direction,
    exitDir: Direction | null,
    cellSize: number,
    waterConfig: { widthRatio: number; curveStrength: number }
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

    const getCenterPoint = (dir: Direction): { x: number; y: number } => {
      const halfPipe = (cellSize * waterConfig.widthRatio) / 2;
      switch (dir) {
        case 'N': return { x: center, y: center + halfPipe };
        case 'S': return { x: center, y: center - halfPipe };
        case 'E': return { x: center - halfPipe, y: center };
        case 'W': return { x: center + halfPipe, y: center };
        default: return { x: center, y: center };
      }
    };

    const entryEdge = getEdgePoint(entryDir);
    const entryCenter = getCenterPoint(entryDir);

    if (!exitDir) {
      // Water hasn't reached exit yet
      return (t: number) => ({
        x: entryEdge.x + (entryCenter.x - entryEdge.x) * t,
        y: entryEdge.y + (entryCenter.y - entryEdge.y) * t
      });
    }

    const exitEdge = getEdgePoint(exitDir);

    // Determine arc parameters
    let arcCenter = { x: 0, y: 0 };
    let startAngle = 0;
    let endAngle = 0;
    const radius = cellSize / 2;

    if ((entryDir === 'N' && exitDir === 'E') || (entryDir === 'E' && exitDir === 'N')) {
      arcCenter = { x: cellSize, y: 0 };
      if (entryDir === 'N') { startAngle = Math.PI; endAngle = Math.PI / 2; }
      else { startAngle = Math.PI / 2; endAngle = Math.PI; }
    } else if ((entryDir === 'E' && exitDir === 'S') || (entryDir === 'S' && exitDir === 'E')) {
      arcCenter = { x: cellSize, y: cellSize };
      if (entryDir === 'E') { startAngle = 3 * Math.PI / 2; endAngle = Math.PI; }
      else { startAngle = Math.PI; endAngle = 3 * Math.PI / 2; }
    } else if ((entryDir === 'S' && exitDir === 'W') || (entryDir === 'W' && exitDir === 'S')) {
      arcCenter = { x: 0, y: cellSize };
      if (entryDir === 'S') { startAngle = 0; endAngle = -Math.PI / 2; }
      else { startAngle = -Math.PI / 2; endAngle = 0; }
    } else if ((entryDir === 'W' && exitDir === 'N') || (entryDir === 'N' && exitDir === 'W')) {
      arcCenter = { x: 0, y: 0 };
      if (entryDir === 'W') { startAngle = Math.PI / 2; endAngle = 0; }
      else { startAngle = 0; endAngle = Math.PI / 2; }
    }

    return (t: number) => {
      const curveStrength = waterConfig.curveStrength;

      // Scale radius based on curveStrength
      const effectiveRadius = radius * curveStrength;

      // Lerp arcCenter toward cell center as curveStrength decreases
      const cellCenter = { x: cellSize / 2, y: cellSize / 2 };
      const effectiveArcCenter = {
        x: cellCenter.x + (arcCenter.x - cellCenter.x) * curveStrength,
        y: cellCenter.y + (arcCenter.y - cellCenter.y) * curveStrength
      };

      // Determine straight vs curved portions
      const straightPortion = (1 - curveStrength) / 2;

      if (t < straightPortion) {
        // Entry straight portion
        const arcStartAngle = startAngle;
        const arcStartX = effectiveArcCenter.x + effectiveRadius * Math.cos(arcStartAngle);
        const arcStartY = effectiveArcCenter.y + effectiveRadius * Math.sin(arcStartAngle);
        const progress = t / straightPortion;
        return {
          x: entryEdge.x + (arcStartX - entryEdge.x) * progress,
          y: entryEdge.y + (arcStartY - entryEdge.y) * progress
        };
      } else if (t > 1 - straightPortion) {
        // Exit straight portion
        const arcEndAngle = endAngle;
        const arcEndX = effectiveArcCenter.x + effectiveRadius * Math.cos(arcEndAngle);
        const arcEndY = effectiveArcCenter.y + effectiveRadius * Math.sin(arcEndAngle);
        const progress = (t - (1 - straightPortion)) / straightPortion;
        return {
          x: arcEndX + (exitEdge.x - arcEndX) * progress,
          y: arcEndY + (exitEdge.y - arcEndY) * progress
        };
      } else {
        // Curved portion
        const curveProgress = (t - straightPortion) / curveStrength;
        const currentAngle = startAngle + (endAngle - startAngle) * curveProgress;
        return {
          x: effectiveArcCenter.x + effectiveRadius * Math.cos(currentAngle),
          y: effectiveArcCenter.y + effectiveRadius * Math.sin(currentAngle)
        };
      }
    };
  }
}

PipeRegistry.register(CurvedPipe.TYPE, CurvedPipe);
