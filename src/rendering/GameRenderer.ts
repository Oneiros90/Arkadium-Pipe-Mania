import { Application, Graphics, Container, Rectangle } from 'pixi.js';
import { logger } from '@/utils/Logger';
import { GameConfig, VisualConfig } from '@/config/schemas';
import { AssetManager } from './AssetManager';

export class GameRenderer {
  private app: Application;
  private gridContainer: Container;
  private queueContainer: Container;
  private uiContainer: Container;
  private assetManager: AssetManager;

  constructor(
    private container: HTMLElement,
    private config: GameConfig,
    private visualConfig: VisualConfig
  ) {
    this.app = new Application();
    this.gridContainer = new Container();
    this.queueContainer = new Container();
    this.uiContainer = new Container();
    this.assetManager = new AssetManager();
  }

  async initialize(): Promise<void> {
    // Preload assets using AssetManager
    const assets = [
      this.visualConfig.assets.backgrounds.empty,
      this.visualConfig.assets.backgrounds.blocked,
      this.visualConfig.assets.backgrounds.tank,
      this.visualConfig.assets.backgrounds.connector,
      this.visualConfig.assets.pipes.straight,
      this.visualConfig.assets.pipes.curved,
      this.visualConfig.assets.pipes.cross
    ];
    await this.assetManager.loadAssets(assets);

    const gridWidth = this.config.grid.width * this.visualConfig.grid.cellSize + this.visualConfig.grid.padding * 2;
    const gridHeight = this.config.grid.height * this.visualConfig.grid.cellSize + this.visualConfig.grid.padding * 2;
    const queueWidth = 200;
    const totalWidth = gridWidth + queueWidth + 20;

    await this.app.init({
      width: totalWidth,
      height: gridHeight,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    this.container.appendChild(this.app.canvas);

    this.gridContainer.x = this.visualConfig.grid.padding;
    this.gridContainer.y = this.visualConfig.grid.padding;

    this.queueContainer.x = gridWidth + 20;
    this.queueContainer.y = this.visualConfig.grid.padding;

    this.app.stage.addChild(this.gridContainer);
    this.app.stage.addChild(this.queueContainer);
    this.app.stage.addChild(this.uiContainer);

    this.drawGridBackground();

    // Ensure grid container captures clicks
    this.gridContainer.hitArea = new Rectangle(0, 0, gridWidth, gridHeight);
    logger.info('GameRenderer', 'Grid container initialized with hitArea', { width: gridWidth, height: gridHeight });
  }

  private drawGridBackground(): void {
    const bg = new Graphics();
    bg.rect(
      0,
      0,
      this.config.grid.width * this.visualConfig.grid.cellSize,
      this.config.grid.height * this.visualConfig.grid.cellSize
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
    return this.visualConfig.grid.cellSize;
  }

  getAssetManager(): AssetManager {
    return this.assetManager;
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
