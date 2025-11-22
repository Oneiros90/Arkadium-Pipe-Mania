import { Container, Sprite } from 'pixi.js';
import { Pipe } from '@/core/Pipe';
import { VisualConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';
import { AssetManager } from './AssetManager';

export class QueueRenderer {
  private queueGraphics: Container[] = [];

  constructor(
    private container: Container,
    private visualConfig: VisualConfig,
    private assetManager: AssetManager
  ) {
  }

  render(queue: Pipe[]): void {
    this.clear();
    logger.info('QueueRenderer', `Rendering queue with ${queue.length} pipes`);

    const totalHeight = (queue.length - 1) * (this.visualConfig.grid.cellSize + 10);

    queue.forEach((pipe, index) => {
      const container = new Container();
      container.y = totalHeight - index * (this.visualConfig.grid.cellSize + 10);

      const pipeBackground = new Sprite(this.assetManager.getTexture(this.visualConfig.assets.pipes.background));
      pipeBackground.width = this.visualConfig.grid.cellSize;
      pipeBackground.height = this.visualConfig.grid.cellSize;
      container.addChild(pipeBackground);

      this.drawPipe(container, pipe);

      this.container.addChild(container);
      this.queueGraphics.push(container);
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

    const pipeSprite = new Sprite(this.assetManager.getTexture(texturePath));
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
