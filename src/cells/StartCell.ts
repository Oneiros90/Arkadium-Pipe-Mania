import { Cell } from '../core/Cell';
import { Position } from '../core/types';
import type { VisualConfig } from '@/config/schemas';
import type { Container, Sprite } from 'pixi.js';
import type { AssetManager } from '@/rendering/AssetManager';
import type { Grid } from '../core/Grid';

/**
 * Represents the starting cell of the water flow.
 */
export class StartCell extends Cell {
  readonly type = 'start';
  readonly isEmpty = false;
  readonly isBlocked = false;
  readonly isStart = true;

  constructor(position: Position) {
    super(position);
  }

  canPlacePipe(): boolean {
    return false;
  }

  getBackgroundTexture(config: VisualConfig): string {
    return config.assets.backgrounds.empty;
  }

  renderCustomGraphics(
    container: Container,
    config: VisualConfig,
    assetManager: AssetManager,
    grid: Grid
  ): void {
    const { Sprite } = require('pixi.js');
    const { row, col } = this.position;

    // Check valid neighbors for connectors
    const neighbors = [
      { dir: 'N', valid: this.isValidNeighbor(row - 1, col, grid), rotation: 0 },
      { dir: 'E', valid: this.isValidNeighbor(row, col + 1, grid), rotation: 90 },
      { dir: 'S', valid: this.isValidNeighbor(row + 1, col, grid), rotation: 180 },
      { dir: 'W', valid: this.isValidNeighbor(row, col - 1, grid), rotation: 270 }
    ];

    // Add connectors for valid neighbors
    neighbors.forEach(n => {
      if (n.valid) {
        const connector: Sprite = new Sprite(assetManager.getTexture(config.assets.backgrounds.connector));
        connector.anchor.set(0.5);
        connector.angle = n.rotation;
        connector.x = config.grid.cellSize / 2;
        connector.y = config.grid.cellSize / 2;
        connector.width = config.grid.cellSize;
        connector.height = config.grid.cellSize;
        container.addChild(connector);
      }
    });

    // Add tank on top (covers connector centers)
    const tank: Sprite = new Sprite(assetManager.getTexture(config.assets.backgrounds.tank));
    tank.width = config.grid.cellSize;
    tank.height = config.grid.cellSize;
    tank.x = 0;
    tank.y = 0;
    container.addChild(tank);
  }

  private isValidNeighbor(row: number, col: number, grid: Grid): boolean {
    const neighbor = grid.getCell({ row, col });
    if (!neighbor) return false; // Out of bounds
    if (neighbor.isBlocked) return false; // Blocked
    return true;
  }
}
