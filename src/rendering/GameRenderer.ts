import { Application, Graphics, Container } from 'pixi.js';
import { GameConfig, VisualConfig } from '@/config/schemas';

export class GameRenderer {
  private app: Application;
  private gridContainer: Container;
  private queueContainer: Container;
  private uiContainer: Container;

  constructor(
    private container: HTMLElement,
    private config: GameConfig,
    private visualConfig: VisualConfig
  ) {
    this.app = new Application();
    this.gridContainer = new Container();
    this.queueContainer = new Container();
    this.uiContainer = new Container();
  }

  async initialize(): Promise<void> {
    const gridWidth = this.config.grid.width * this.visualConfig.cellSize + this.visualConfig.gridPadding * 2;
    const gridHeight = this.config.grid.height * this.visualConfig.cellSize + this.visualConfig.gridPadding * 2;
    const queueWidth = 200;
    const totalWidth = gridWidth + queueWidth + 20;

    await this.app.init({
      width: totalWidth,
      height: gridHeight,
      backgroundColor: 0x1a1a1a,
      antialias: true
    });

    this.container.appendChild(this.app.canvas);

    this.gridContainer.x = this.visualConfig.gridPadding;
    this.gridContainer.y = this.visualConfig.gridPadding;

    this.queueContainer.x = gridWidth + 20;
    this.queueContainer.y = this.visualConfig.gridPadding;

    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.queueContainer);
    this.app.stage.addChild(this.uiContainer);

    this.drawGridBackground();
  }

  private drawGridBackground(): void {
    const bg = new Graphics();
    bg.rect(
      0,
      0,
      this.config.grid.width * this.visualConfig.cellSize,
      this.config.grid.height * this.visualConfig.cellSize
    );
    bg.fill(0x2a2a2a);
    this.gridContainer.addChild(bg);
  }

  getGridContainer(): Container {
    return this.gridContainer;
  }

  getQueueContainer(): Container {
    return this.queueContainer;
  }

  getUIContainer(): Container {
    return this.uiContainer;
  }

  getCellSize(): number {
    return this.visualConfig.cellSize;
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
