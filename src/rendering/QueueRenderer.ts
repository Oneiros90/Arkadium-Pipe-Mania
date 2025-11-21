import { Container, Graphics, Text, TextStyle, Sprite } from 'pixi.js';
import { Pipe } from '@/core/Pipe';
import { VisualConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

export class QueueRenderer {
  private queueGraphics: Container[] = [];

  constructor(
    private container: Container,
    private visualConfig: VisualConfig
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
    logger.info('QueueRenderer', `Rendering queue with ${queue.length} pipes`);

    queue.forEach((pipe, index) => {
      const graphic = new Container();
      graphic.y = index * (this.visualConfig.grid.cellSize + 10);

      const padding = 2;
      const size = this.visualConfig.grid.cellSize - padding * 2;

      const bg = new Graphics();
      bg.rect(padding, padding, size, size);
      bg.stroke({ width: 1, color: 0x555555 });
      graphic.addChild(bg);

      this.drawPipe(graphic, pipe);

      this.container.addChild(graphic);
      this.queueGraphics.push(graphic);
    });
  }

  private drawPipe(container: Container, pipe: Pipe): void {
    let texturePath = '';
    switch (pipe.type) {
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

    const pipeSprite = Sprite.from(texturePath);
    pipeSprite.width = this.visualConfig.grid.cellSize;
    pipeSprite.height = this.visualConfig.grid.cellSize;

    pipeSprite.anchor.set(0.5);
    pipeSprite.x = this.visualConfig.grid.cellSize / 2;
    pipeSprite.y = this.visualConfig.grid.cellSize / 2;
    pipeSprite.angle = pipe.rotation;

    container.addChild(pipeSprite);
  }

  clear(): void {
    this.queueGraphics.forEach((graphic) => graphic.destroy());
    this.queueGraphics = [];
  }
}
