import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Pipe } from '@/core/Pipe';

export class QueueRenderer {
  private queueGraphics: Graphics[] = [];

  constructor(
    private container: Container,
    private cellSize: number
  ) {
    const title = new Text({
      text: 'Next Pipes',
      style: new TextStyle({
        fontSize: 18,
        fill: 0xffffff,
        fontFamily: 'system-ui'
      })
    });
    title.y = -30;
    this.container.addChild(title);
  }

  render(queue: Pipe[]): void {
    this.clear();

    queue.forEach((pipe, index) => {
      const graphic = new Graphics();
      graphic.y = index * (this.cellSize + 10);
      
      const padding = 2;
      const size = this.cellSize - padding * 2;
      
      graphic.rect(padding, padding, size, size);
      graphic.stroke({ width: 1, color: 0x555555 });

      this.drawPipe(graphic, pipe, this.cellSize);
      
      this.container.addChild(graphic);
      this.queueGraphics.push(graphic);
    });
  }

  private drawPipe(graphic: Graphics, pipe: Pipe, cellSize: number): void {
    const color = 0xcccccc;
    const center = cellSize / 2;
    const pipeWidth = cellSize * 0.2;
    const halfPipe = pipeWidth / 2;

    const connections = pipe.getActiveConnections();

    connections.forEach((direction) => {
      graphic.rect(0, 0, 1, 1);
      graphic.fill(color);

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
      graphic.fill(color);
    });
  }

  clear(): void {
    this.queueGraphics.forEach((graphic) => graphic.destroy());
    this.queueGraphics = [];
  }
}
