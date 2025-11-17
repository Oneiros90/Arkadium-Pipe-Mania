import { Graphics, Container } from 'pixi.js';
import { Grid } from '@/core/Grid';
import { Cell } from '@/core/Cell';
import { CellType, Direction } from '@/core/types';

export class GridRenderer {
  private cellGraphics: Map<string, Graphics> = new Map();

  constructor(
    private container: Container,
    private grid: Grid,
    private cellSize: number
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
    let graphic = this.cellGraphics.get(key);

    if (!graphic) {
      graphic = new Graphics();
      graphic.x = cell.position.col * this.cellSize;
      graphic.y = cell.position.row * this.cellSize;
      this.container.addChild(graphic);
      this.cellGraphics.set(key, graphic);
    }

    graphic.clear();

    const padding = 2;
    const size = this.cellSize - padding * 2;

    switch (cell.type) {
      case CellType.Blocked:
        graphic.rect(padding, padding, size, size);
        graphic.fill(0x444444);
        break;
      case CellType.Start:
        graphic.rect(padding, padding, size, size);
        graphic.fill(0x00aaff);
        break;
      case CellType.Empty:
        graphic.rect(padding, padding, size, size);
        graphic.stroke({ width: 1, color: 0x555555 });
        break;
      case CellType.Pipe:
        this.drawPipeCell(graphic, cell, padding, size);
        break;
    }
  }

  private drawPipeCell(graphic: Graphics, cell: Cell, padding: number, size: number): void {
    graphic.rect(padding, padding, size, size);
    graphic.stroke({ width: 1, color: 0x555555 });

    if (!cell.pipe) return;

    const center = this.cellSize / 2;
    const pipeWidth = this.cellSize * 0.2;
    const halfPipe = pipeWidth / 2;

    const connections = cell.pipe.getActiveConnections();

    connections.forEach((direction) => {
      const emptyColor = 0xcccccc;
      graphic.rect(0, 0, 1, 1);
      graphic.fill(emptyColor);

      switch (direction) {
        case 'N':
          graphic.rect(center - halfPipe, 0, pipeWidth, center + halfPipe);
          break;
        case 'S':
          graphic.rect(center - halfPipe, center - halfPipe, pipeWidth, center + halfPipe);
          break;
        case 'E':
          graphic.rect(center - halfPipe, center - halfPipe, center + halfPipe, pipeWidth);
          break;
        case 'W':
          graphic.rect(0, center - halfPipe, center + halfPipe, pipeWidth);
          break;
      }
      graphic.fill(emptyColor);
    });

    if (cell.waterLevel > 0 && cell.waterEntryDirection) {
      const waterColor = 0x00ccff;
      const fillAmount = cell.waterLevel;
      const entryDir = cell.waterEntryDirection;
      const exitDir = cell.pipe.getExitDirection(entryDir);

      const getSegmentLength = (direction: Direction, isEntry: boolean): number => {
        switch (direction) {
          case 'N':
            return isEntry ? (center + halfPipe) : (center - halfPipe);
          case 'S':
            return isEntry ? (this.cellSize - center + halfPipe) : (this.cellSize - center - halfPipe);
          case 'E':
            return isEntry ? (this.cellSize - center + halfPipe) : (this.cellSize - center - halfPipe);
          case 'W':
            return isEntry ? (center + halfPipe) : (center - halfPipe);
          default:
            return 0;
        }
      };

      const entryLength = getSegmentLength(entryDir, true);
      const exitLength = exitDir ? getSegmentLength(exitDir, false) : 0;
      const totalLength = entryLength + exitLength;

      const drawWaterSegment = (direction: Direction, progress: number, isEntry: boolean) => {
        if (progress <= 0) return;
        progress = Math.min(1, progress);

        graphic.rect(0, 0, 1, 1);
        graphic.fill(waterColor);

        switch (direction) {
          case 'N': {
            if (isEntry) {
              const startY = 0;
              const endY = center + halfPipe;
              const currentLength = (endY - startY) * progress;
              graphic.rect(center - halfPipe, startY, pipeWidth, currentLength);
            } else {
              const startY = center - halfPipe;
              const endY = 0;
              const totalLength = startY - endY;
              const currentLength = totalLength * progress;
              graphic.rect(center - halfPipe, startY - currentLength, pipeWidth, currentLength);
            }
            break;
          }
          case 'S': {
            if (isEntry) {
              const startY = this.cellSize;
              const endY = center - halfPipe;
              const totalLength = startY - endY;
              const currentLength = totalLength * progress;
              graphic.rect(center - halfPipe, startY - currentLength, pipeWidth, currentLength);
            } else {
              const startY = center + halfPipe;
              const endY = this.cellSize;
              const currentLength = (endY - startY) * progress;
              graphic.rect(center - halfPipe, startY, pipeWidth, currentLength);
            }
            break;
          }
          case 'E': {
            if (isEntry) {
              const startX = this.cellSize;
              const endX = center - halfPipe;
              const totalLength = startX - endX;
              const currentLength = totalLength * progress;
              graphic.rect(startX - currentLength, center - halfPipe, currentLength, pipeWidth);
            } else {
              const startX = center + halfPipe;
              const endX = this.cellSize;
              const currentLength = (endX - startX) * progress;
              graphic.rect(startX, center - halfPipe, currentLength, pipeWidth);
            }
            break;
          }
          case 'W': {
            if (isEntry) {
              const startX = 0;
              const endX = center + halfPipe;
              const currentLength = (endX - startX) * progress;
              graphic.rect(startX, center - halfPipe, currentLength, pipeWidth);
            } else {
              const startX = center - halfPipe;
              const endX = 0;
              const totalLength = startX - endX;
              const currentLength = totalLength * progress;
              graphic.rect(startX - currentLength, center - halfPipe, currentLength, pipeWidth);
            }
            break;
          }
        }
        graphic.fill(waterColor);
      };

      const entryRatio = entryLength / totalLength;
      const exitRatio = exitLength / totalLength;

      if (fillAmount <= entryRatio) {
        const entryProgress = fillAmount / entryRatio;
        drawWaterSegment(entryDir, entryProgress, true);
      } else {
        drawWaterSegment(entryDir, 1, true);
        if (exitDir) {
          const exitProgress = (fillAmount - entryRatio) / exitRatio;
          drawWaterSegment(exitDir, exitProgress, false);
        }
      }
    }
  }

  updateCell(row: number, col: number): void {
    const cell = this.grid.getCell({ row, col });
    if (cell) {
      this.drawCell(cell);
    }
  }

  clear(): void {
    this.cellGraphics.forEach((graphic) => graphic.destroy());
    this.cellGraphics.clear();
  }
}
