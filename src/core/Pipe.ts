import { Direction } from './types';
import type { VisualConfig } from '@/config/schemas';

interface WaterConfig {
  widthRatio: number;
  curveStrength: number;
}

/**
 * Abstract base class representing a pipe segment.
 * Defines connections and rotation.
 */
export abstract class Pipe {
  constructor(
    public readonly rotation: number,
    public readonly connections: Direction[][]
  ) { }

  abstract readonly type: string;

  abstract getTexturePath(config: VisualConfig): string;
  abstract getWaterPathFunction(
    entryDir: Direction,
    exitDir: Direction | null,
    cellSize: number,
    waterConfig: WaterConfig
  ): (t: number) => { x: number; y: number };

  getActiveConnections(): Direction[] {
    const rotationIndex = this.rotation / 90;
    return this.connections[rotationIndex % this.connections.length];
  }

  hasConnection(direction: Direction): boolean {
    return this.getActiveConnections().includes(direction);
  }

  getExitDirection(entryDirection: Direction): Direction | null {
    const connections = this.getActiveConnections();

    if (!connections.includes(entryDirection)) {
      return null;
    }

    return connections.find(d => d !== entryDirection) || null;
  }
}
