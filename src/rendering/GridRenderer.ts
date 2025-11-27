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

    switch (cell.type) {
      case 'empty':
        bg.texture = this.assetManager.getTexture(this.visualConfig.assets.backgrounds.empty);
        break;
      case 'blocked':
        bg.texture = this.assetManager.getTexture(this.visualConfig.assets.backgrounds.blocked);
        break;
      case 'start':
        // Set empty texture so sprite has proper dimensions
        bg.texture = this.assetManager.getTexture(this.visualConfig.assets.backgrounds.empty);

        // Add connectors first (they go below)
        const { row, col } = cell.position;
        const neighbors = [
          { dir: 'N', valid: this.isValidNeighbor(row - 1, col), rotation: 0 },
          { dir: 'E', valid: this.isValidNeighbor(row, col + 1), rotation: 90 },
          { dir: 'S', valid: this.isValidNeighbor(row + 1, col), rotation: 180 },
          { dir: 'W', valid: this.isValidNeighbor(row, col - 1), rotation: 270 }
        ];

        // Add tank on top (covers connector centers)
        const tank = new Sprite(this.assetManager.getTexture(this.visualConfig.assets.backgrounds.tank));
        tank.width = this.visualConfig.grid.cellSize;
        tank.height = this.visualConfig.grid.cellSize;
        tank.x = 0;
        tank.y = 0;
        bgContainer.addChild(tank);

        neighbors.forEach(n => {
          if (n.valid) {
            const connector = new Sprite(this.assetManager.getTexture(this.visualConfig.assets.backgrounds.connector));
            connector.anchor.set(0.5);
            connector.angle = n.rotation;
            // Position at the center of the cell
            connector.x = this.visualConfig.grid.cellSize / 2;
            connector.y = this.visualConfig.grid.cellSize / 2;
            // Size the connector appropriately (you may need to adjust this based on your asset)
            connector.width = this.visualConfig.grid.cellSize;
            connector.height = this.visualConfig.grid.cellSize;
            bgContainer.addChild(connector);
          }
        });
        break;
      case 'pipe':
        bg.texture = this.assetManager.getTexture(this.visualConfig.assets.pipes.background);
        this.drawPipeCell(entry!, cell);
        break;
    }
  }

  private drawPipeCell(entry: { bgContainer: Container; bg: Sprite; pipe?: Sprite; water: Graphics }, cell: Cell): void {
    if (!cell.pipe) return;

    let texturePath = '';
    switch (cell.pipe.type) {
      case 'straight':
        texturePath = this.visualConfig.assets.pipes.straight;
        break;
      case 'curved':
        texturePath = this.visualConfig.assets.pipes.curved;
        break;
      case 'cross':
        texturePath = this.visualConfig.assets.pipes.cross;
        break;
    }

    // AssetManager handles pixel art settings
    const pipeSprite = new Sprite(this.assetManager.getTexture(texturePath));
    pipeSprite.width = this.visualConfig.grid.cellSize;
    pipeSprite.height = this.visualConfig.grid.cellSize;
    pipeSprite.anchor.set(0.5);
    pipeSprite.x = cell.position.col * this.visualConfig.grid.cellSize + this.visualConfig.grid.cellSize / 2;
    pipeSprite.y = cell.position.row * this.visualConfig.grid.cellSize + this.visualConfig.grid.cellSize / 2;
    pipeSprite.angle = cell.pipe.rotation;

    this.pipeLayer.addChild(pipeSprite);
    entry.pipe = pipeSprite;

    const center = this.visualConfig.grid.cellSize / 2;
    const pipeWidth = this.visualConfig.grid.cellSize * this.visualConfig.water.widthRatio;
    const halfPipe = pipeWidth / 2;

    cell.waterFlows.forEach(flow => {
      this.drawWaterFlow(entry.water, cell, flow.level, flow.entryDirection, center, halfPipe, pipeWidth);
    });
  }

  private getPathFunction(entryDir: Direction, exitDir: Direction | null): (t: number) => { x: number; y: number } {
    const center = this.visualConfig.grid.cellSize / 2;
    const halfPipe = (this.visualConfig.grid.cellSize * this.visualConfig.water.widthRatio) / 2;

    const getEdgePoint = (dir: Direction): { x: number; y: number } => {
      switch (dir) {
        case 'N': return { x: center, y: 0 };
        case 'S': return { x: center, y: this.visualConfig.grid.cellSize };
        case 'E': return { x: this.visualConfig.grid.cellSize, y: center };
        case 'W': return { x: 0, y: center };
        default: return { x: center, y: center };
      }
    };

    const getCenterPoint = (dir: Direction): { x: number; y: number } => {
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
      return (t: number) => ({
        x: entryEdge.x + (entryCenter.x - entryEdge.x) * t,
        y: entryEdge.y + (entryCenter.y - entryEdge.y) * t
      });
    }

    const exitEdge = getEdgePoint(exitDir);

    const isStraight = (
      (entryDir === 'N' && exitDir === 'S') ||
      (entryDir === 'S' && exitDir === 'N') ||
      (entryDir === 'E' && exitDir === 'W') ||
      (entryDir === 'W' && exitDir === 'E')
    );

    if (isStraight) {
      return (t: number) => ({
        x: entryEdge.x + (exitEdge.x - entryEdge.x) * t,
        y: entryEdge.y + (exitEdge.y - entryEdge.y) * t
      });
    }

    // Circular Arc Logic for Curves
    // Determine the corner around which we are turning
    // NE: Top-Right corner (cellSize, 0)
    // ES: Bottom-Right corner (cellSize, cellSize)
    // SW: Bottom-Left corner (0, cellSize)
    // WN: Top-Left corner (0, 0)

    let arcCenter = { x: 0, y: 0 };
    let startAngle = 0;
    let endAngle = 0;
    // let clockwise = false;
    const radius = this.visualConfig.grid.cellSize / 2;

    // Map directions to angles (radians)
    // 0 is Right, PI/2 is Down, PI is Left, 3PI/2 is Up

    if ((entryDir === 'N' && exitDir === 'E') || (entryDir === 'E' && exitDir === 'N')) {
      arcCenter = { x: this.visualConfig.grid.cellSize, y: 0 };
      // N->E: Start at Top (PI), End at Right (PI/2). Clockwise? No.
      // Top relative to (100,0) is (-50, 0) -> PI.
      // Right relative to (100,0) is (0, 50) -> PI/2.
      // N->E: PI -> PI/2. Counter-Clockwise.
      // E->N: PI/2 -> PI. Clockwise.
      if (entryDir === 'N') { startAngle = Math.PI; endAngle = Math.PI / 2; }
      else { startAngle = Math.PI / 2; endAngle = Math.PI; }
    } else if ((entryDir === 'E' && exitDir === 'S') || (entryDir === 'S' && exitDir === 'E')) {
      arcCenter = { x: this.visualConfig.grid.cellSize, y: this.visualConfig.grid.cellSize };
      // E->S: Right (3PI/2 or -PI/2) -> Bottom (PI).
      // Right relative to (100,100) is (0, -50) -> -PI/2 (3PI/2).
      // Bottom relative to (100,100) is (-50, 0) -> PI.
      // E->S: 3PI/2 -> PI. Counter-Clockwise (270 -> 180).
      if (entryDir === 'E') { startAngle = 3 * Math.PI / 2; endAngle = Math.PI; }
      else { startAngle = Math.PI; endAngle = 3 * Math.PI / 2; }
    } else if ((entryDir === 'S' && exitDir === 'W') || (entryDir === 'W' && exitDir === 'S')) {
      arcCenter = { x: 0, y: this.visualConfig.grid.cellSize };
      // S->W: Bottom (0) -> Left (3PI/2 or -PI/2).
      // Bottom relative to (0,100) is (50, 0) -> 0.
      // Left relative to (0,100) is (0, -50) -> -PI/2.
      // S->W: 0 -> -PI/2. Counter-Clockwise.
      if (entryDir === 'S') { startAngle = 0; endAngle = -Math.PI / 2; }
      else { startAngle = -Math.PI / 2; endAngle = 0; }
    } else if ((entryDir === 'W' && exitDir === 'N') || (entryDir === 'N' && exitDir === 'W')) {
      arcCenter = { x: 0, y: 0 };
      // W->N: Left (PI/2) -> Top (0).
      // Left relative to (0,0) is (0, 50) -> PI/2.
      // Top relative to (0,0) is (50, 0) -> 0.
      // W->N: PI/2 -> 0. Counter-Clockwise.
      if (entryDir === 'W') { startAngle = Math.PI / 2; endAngle = 0; }
      else { startAngle = 0; endAngle = Math.PI / 2; }
    }


    return (t: number) => {
      const curveStrength = this.visualConfig.water.curveStrength;

      // Scale radius based on curveStrength (0 = no curve, 1 = full curve)
      const effectiveRadius = radius * curveStrength;

      // Lerp arcCenter toward cell center as curveStrength decreases
      const cellCenter = { x: this.visualConfig.grid.cellSize / 2, y: this.visualConfig.grid.cellSize / 2 };
      const effectiveArcCenter = {
        x: cellCenter.x + (arcCenter.x - cellCenter.x) * curveStrength,
        y: cellCenter.y + (arcCenter.y - cellCenter.y) * curveStrength
      };

      // Determine straight vs curved portions based on curveStrength
      // With low curveStrength, more of the path is straight
      const straightPortion = (1 - curveStrength) / 2;

      if (t < straightPortion) {
        // Entry straight portion - line from entry to arc start
        const arcStartAngle = startAngle;
        const arcStartX = effectiveArcCenter.x + effectiveRadius * Math.cos(arcStartAngle);
        const arcStartY = effectiveArcCenter.y + effectiveRadius * Math.sin(arcStartAngle);
        const progress = t / straightPortion;
        return {
          x: entryEdge.x + (arcStartX - entryEdge.x) * progress,
          y: entryEdge.y + (arcStartY - entryEdge.y) * progress
        };
      } else if (t > 1 - straightPortion) {
        // Exit straight portion - line from arc end to exit
        const arcEndAngle = endAngle;
        const arcEndX = effectiveArcCenter.x + effectiveRadius * Math.cos(arcEndAngle);
        const arcEndY = effectiveArcCenter.y + effectiveRadius * Math.sin(arcEndAngle);
        const progress = (t - (1 - straightPortion)) / straightPortion;
        return {
          x: arcEndX + (exitEdge.x - arcEndX) * progress,
          y: arcEndY + (exitEdge.y - arcEndY) * progress
        };
      } else {
        // Curved portion - arc between start and end angles
        const curveProgress = (t - straightPortion) / curveStrength;
        const currentAngle = startAngle + (endAngle - startAngle) * curveProgress;
        return {
          x: effectiveArcCenter.x + effectiveRadius * Math.cos(currentAngle),
          y: effectiveArcCenter.y + effectiveRadius * Math.sin(currentAngle)
        };
      }
    };
  }

  private drawWaterFlow(
    graphic: Graphics,
    cell: Cell,
    fillAmount: number,
    entryDir: Direction,
    _center: number,
    _halfPipe: number,
    pipeWidth: number
  ): void {
    if (!cell.pipe || fillAmount <= 0) return;
    const exitDir = cell.pipe.getExitDirection(entryDir);
    const pathFunc = this.getPathFunction(entryDir, exitDir);
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

  private isValidNeighbor(row: number, col: number): boolean {
    const neighbor = this.grid.getCell({ row, col });
    if (!neighbor) return false; // Out of bounds
    if (neighbor.isBlocked) return false; // Blocked
    return true;
  }
}
