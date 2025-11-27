import { Container, Sprite } from 'pixi.js';
import { Pipe } from '@/core/Pipe';
import { VisualConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';
import { AssetManager } from './AssetManager';

/**
 * Renders the queue of upcoming pipes.
 */
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

    const totalHeight = (queue.length - 1) * (this.visualConfig.grid.cellSize + this.visualConfig.queue.gap);

    queue.forEach((pipe, index) => {
      const pipeContainer = new Container();
      pipeContainer.y = totalHeight - index * (this.visualConfig.grid.cellSize + this.visualConfig.queue.gap);
      pipeContainer.alpha = index === 0 ? 1 : this.visualConfig.queue.alpha;

      const pipeBackground = new Sprite(this.assetManager.getTexture(this.visualConfig.assets.pipes.background));
      pipeBackground.width = this.visualConfig.grid.cellSize;
      pipeBackground.height = this.visualConfig.grid.cellSize;
      pipeContainer.addChild(pipeBackground);

      const pipeSprite = this.getPipeSprite(pipe);
      pipeContainer.addChild(pipeSprite);

      this.container.addChild(pipeContainer);
      this.queueGraphics.push(pipeContainer);
    });
  }

  private getPipeSprite(pipe: Pipe): Sprite {
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
    return pipeSprite;
  }

  clear(): void {
    this.queueGraphics.forEach((graphic) => graphic.destroy());
    this.queueGraphics = [];
  }
}
