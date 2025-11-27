import { Direction } from './types';

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
