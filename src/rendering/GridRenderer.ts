import { Graphics, Container } from 'pixi.js';
import { Grid } from '@/core/Grid';
import { Cell } from '@/core/Cell';
import { CellType, Direction } from '@/core/types';
import { VisualConfig } from '@/config/schemas';

export class GridRenderer {
  private cellGraphics: Map<string, { bg: Graphics; fg: Graphics }> = new Map();

  constructor(
    private container: Container,
    private grid: Grid,
    private visualConfig: VisualConfig
  ) {}

  initialize(): void {
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
      const bg = new Graphics();
      const fg = new Graphics();
      bg.x = fg.x = cell.position.col * this.visualConfig.cellSize;
      bg.y = fg.y = cell.position.row * this.visualConfig.cellSize;
      this.container.addChild(bg);
      this.container.addChild(fg);
      entry = { bg, fg };
      this.cellGraphics.set(key, entry);
    }

    const { bg, fg } = entry;

    bg.clear();
    fg.clear();

    switch (cell.type) {
      case CellType.Empty:
        bg.rect(0, 0, this.visualConfig.cellSize, this.visualConfig.cellSize);
        bg.stroke({ width: 1, color: this.visualConfig.borderColor });
        break;
      case CellType.Blocked:
        bg.rect(0, 0, this.visualConfig.cellSize, this.visualConfig.cellSize);
        bg.fill(this.visualConfig.blockedColor);
        break;
      case CellType.Start:
        bg.rect(0, 0, this.visualConfig.cellSize, this.visualConfig.cellSize);
        bg.fill(this.visualConfig.startColor);
        break;
      case CellType.Pipe:
        this.drawPipeCell(bg, fg, cell);
        break;
    }
  }

  private drawPipeCell(bg: Graphics, fg: Graphics, cell: Cell): void {
    bg.rect(0, 0, this.visualConfig.cellSize, this.visualConfig.cellSize);
    bg.stroke({ width: 1, color: this.visualConfig.borderColor });

    if (!cell.pipe) return;

    const center = this.visualConfig.cellSize / 2;
    const pipeWidth = this.visualConfig.cellSize * this.visualConfig.pipeWidthRatio;
    const halfPipe = pipeWidth / 2;

    const connections = cell.pipe.getActiveConnections();

    connections.forEach((direction) => {
      const emptyColor = this.visualConfig.pipeEmptyColor;

      switch (direction) {
        case 'N':
          fg.rect(center - halfPipe, 0, pipeWidth, center + halfPipe);
          break;
        case 'S':
          fg.rect(center - halfPipe, center - halfPipe, pipeWidth, center + halfPipe);
          break;
        case 'E':
          fg.rect(center - halfPipe, center - halfPipe, center + halfPipe, pipeWidth);
          break;
        case 'W':
          fg.rect(0, center - halfPipe, center + halfPipe, pipeWidth);
          break;
      }
      fg.fill(emptyColor);
    });

    cell.waterFlows.forEach(flow => {
      this.drawWaterFlow(fg, cell, flow.level, flow.entryDirection, center, halfPipe, pipeWidth);
    });
  }

  private getPathFunction(entryDir: Direction, exitDir: Direction | null): (t: number) => { x: number; y: number } {
    const center = this.visualConfig.cellSize / 2;
    const halfPipe = (this.visualConfig.cellSize * this.visualConfig.pipeWidthRatio) / 2;

    const getEdgePoint = (dir: Direction): { x: number; y: number } => {
      switch (dir) {
        case 'N': return { x: center, y: 0 };
        case 'S': return { x: center, y: this.visualConfig.cellSize };
        case 'E': return { x: this.visualConfig.cellSize, y: center };
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

    const exitCenter = getCenterPoint(exitDir);
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

    const cornerX = (entryDir === 'E' || entryDir === 'W') ? entryCenter.x : exitCenter.x;
    const cornerY = (entryDir === 'N' || entryDir === 'S') ? entryCenter.y : exitCenter.y;
    const controlPoint = { x: cornerX, y: cornerY };

    return (t: number) => {
      const adjustedControl = {
        x: entryEdge.x + (controlPoint.x - entryEdge.x) + (exitEdge.x - controlPoint.x) * this.visualConfig.curveStrength,
        y: entryEdge.y + (controlPoint.y - entryEdge.y) + (exitEdge.y - controlPoint.y) * this.visualConfig.curveStrength
      };

      const mt = 1 - t;
      const mt2 = mt * mt;
      const t2 = t * t;

      return {
        x: mt2 * entryEdge.x + 2 * mt * t * adjustedControl.x + t2 * exitEdge.x,
        y: mt2 * entryEdge.y + 2 * mt * t * adjustedControl.y + t2 * exitEdge.y
      };
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
    const numPoints = Math.max(2, Math.floor(this.visualConfig.samples * maxT));

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
    graphic.stroke({ width: pipeWidth, color: this.visualConfig.waterColor, cap: 'round', join: 'round' });
  }

  updateCell(row: number, col: number): void {
    const cell = this.grid.getCell({ row, col });
    if (cell) {
      this.drawCell(cell);
    }
  }

  clear(): void {
    this.cellGraphics.forEach((entry) => {
      entry.bg.destroy();
      entry.fg.destroy();
    });
    this.cellGraphics.clear();
  }
}
