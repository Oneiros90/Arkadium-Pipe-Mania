import { Graphics, Container, Sprite } from 'pixi.js';
import { Grid } from '@/core/Grid';
import { Cell } from '@/core/Cell';
import { Direction } from '@/core/types';
import { VisualConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';
import { AssetManager } from './AssetManager';

/**
 * Handles the rendering of the game grid, including cells, pipes, and water flow.
 */
export class GridRenderer {
  private cellGraphics: Map<string, { bgContainer: Container; bg: Sprite; pipe?: Sprite; water: Graphics }> = new Map();

  private bgLayer: Container;
  private waterLayer: Container;
  private pipeLayer: Container;

  constructor(
    private container: Container,
    private grid: Grid,
    private visualConfig: VisualConfig,
    private assetManager: AssetManager
  ) {
    this.bgLayer = new Container();
    this.waterLayer = new Container();
    this.pipeLayer = new Container();

    this.container.sortableChildren = true;

    this.bgLayer.zIndex = 0;
    this.pipeLayer.zIndex = 1;
    this.waterLayer.zIndex = visualConfig.water.renderLayer === 'above' ? 2 : 0.5;

    this.container.addChild(this.bgLayer);
    this.container.addChild(this.waterLayer);
    this.container.addChild(this.pipeLayer);
  }

  initialize(): void {
    logger.info('GridRenderer', 'Initializing grid rendering');
    this.grid.forEachCell((cell) => {
      this.drawCell(cell);
    });
  }

  private getCellKey(row: number, col: number): string {
    return `${row}-${col}`;
  }

  private drawCell(cell: Cell): void {
    const key = this.getCellKey(cell.position.row, cell.position.col);
    let entry = this.cellGraphics.get(key);

    if (!entry) {
      const bgContainer = new Container();
      const bg = new Sprite(this.assetManager.getTexture(this.visualConfig.assets.backgrounds.empty));
      const water = new Graphics();

      bgContainer.x = cell.position.col * this.visualConfig.grid.cellSize;
      bgContainer.y = cell.position.row * this.visualConfig.grid.cellSize;

      bg.x = 0;
      bg.y = 0;

      water.x = bgContainer.x;
      water.y = bgContainer.y;

      bgContainer.addChild(bg);
      this.bgLayer.addChild(bgContainer);
      this.waterLayer.addChild(water);

      entry = { bgContainer, bg, water };
      this.cellGraphics.set(key, entry);
    }

    const { bgContainer, bg, water } = entry!;

    // Reset background
    bg.width = this.visualConfig.grid.cellSize;
    bg.height = this.visualConfig.grid.cellSize;

    // Clear foreground container (except water graphics which we reuse)
    if (entry!.pipe) {
      entry!.pipe.destroy();
      entry!.pipe = undefined;
    }
    water.clear();

    // Clear any children from bgContainer (e.g., start cell connectors) except the bg sprite itself
    bgContainer.removeChildren();
    bgContainer.addChild(bg);

    // Use abstract method to get background texture
    bg.texture = this.assetManager.getTexture(cell.getBackgroundTexture(this.visualConfig));

    // Call custom rendering if the cell provides it
    if (cell.renderCustomGraphics) {
      cell.renderCustomGraphics(bgContainer, this.visualConfig, this.assetManager, this.grid);
    }

    // If it's a pipe cell, draw the pipe
    if (cell.hasPipe()) {
      this.drawPipeCell(entry!, cell);
    }
  }

  private drawPipeCell(entry: { bgContainer: Container; bg: Sprite; pipe?: Sprite; water: Graphics }, cell: Cell): void {
    if (!cell.pipe) return;

    // Use abstract method to get texture path
    const texturePath = cell.pipe.getTexturePath(this.visualConfig);
    const pipeSprite = new Sprite(this.assetManager.getTexture(texturePath));
    pipeSprite.width = this.visualConfig.grid.cellSize;
    pipeSprite.height = this.visualConfig.grid.cellSize;
    pipeSprite.anchor.set(0.5);
    pipeSprite.x = cell.position.col * this.visualConfig.grid.cellSize + this.visualConfig.grid.cellSize / 2;
    pipeSprite.y = cell.position.row * this.visualConfig.grid.cellSize + this.visualConfig.grid.cellSize / 2;
    pipeSprite.angle = cell.pipe.rotation;

    this.pipeLayer.addChild(pipeSprite);
    entry.pipe = pipeSprite;

    const pipeWidth = this.visualConfig.grid.cellSize * this.visualConfig.water.widthRatio;

    cell.waterFlows.forEach(flow => {
      this.drawWaterFlow(entry.water, cell, flow.level, flow.entryDirection, pipeWidth);
    });
  }

  private drawWaterFlow(
    graphic: Graphics,
    cell: Cell,
    fillAmount: number,
    entryDir: Direction,
    pipeWidth: number
  ): void {
    if (!cell.pipe || fillAmount <= 0) return;
    const exitDir = cell.pipe.getExitDirection(entryDir);

    // Get path function from the pipe itself
    const pathFunc = cell.pipe.getWaterPathFunction(
      entryDir,
      exitDir,
      this.visualConfig.grid.cellSize,
      {
        widthRatio: this.visualConfig.water.widthRatio,
        curveStrength: this.visualConfig.water.curveStrength
      }
    );

    const maxT = Math.min(1, fillAmount);
    const numPoints = Math.max(2, Math.floor(this.visualConfig.water.samples * maxT));

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const t = (i / (numPoints - 1)) * maxT;
      points.push(pathFunc(t));
    }

    if (points.length < 2) return;

    graphic.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphic.lineTo(points[i].x, points[i].y);
    }
    graphic.stroke({ width: pipeWidth, color: this.visualConfig.water.color, cap: 'round', join: 'round' });
  }

  updateCell(row: number, col: number): void {
    const cell = this.grid.getCell({ row, col });
    if (cell) {
      this.drawCell(cell);
    }
  }

  clear(): void {
    this.cellGraphics.forEach((entry) => {
      entry.bgContainer.destroy({ children: true });
      entry.water.destroy();
      if (entry.pipe) entry.pipe.destroy();
    });
    this.cellGraphics.clear();
  }
}
