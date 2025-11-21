import { ConfigLoader } from './config/ConfigLoader';
import { GameState } from './core/GameState';
import { GameRenderer } from './rendering/GameRenderer';
import { GridRenderer } from './rendering/GridRenderer';
import { QueueRenderer } from './rendering/QueueRenderer';
import { logger, LogLevel } from './utils/Logger';

class Game {
  private gameState!: GameState;
  private gameRenderer!: GameRenderer;
  private gridRenderer!: GridRenderer;
  private queueRenderer!: QueueRenderer;
  private lastTime: number = 0;

  async initialize(): Promise<void> {
    logger.setMinLevel(LogLevel.Debug);
    logger.info('Game', 'Initializing game...');

    const config = await ConfigLoader.loadFromFile('/config/game.yaml');
    const visualConfig = await ConfigLoader.loadVisualConfig('/config/visual.yaml');
    
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Game container not found');
    }

    this.gameRenderer = new GameRenderer(container, config, visualConfig);
    await this.gameRenderer.initialize();

    this.gameState = new GameState(
      config,
      visualConfig,
      this.handleCellUpdate.bind(this),
      this.handleQueueUpdate.bind(this),
      this.handleGameEnd.bind(this)
    );

    this.gridRenderer = new GridRenderer(
      this.gameRenderer.getGridContainer(),
      this.gameState.getGrid(),
      visualConfig
    );

    this.queueRenderer = new QueueRenderer(
      this.gameRenderer.getQueueContainer(),
      this.gameRenderer.getCellSize()
    );

    this.setupClickHandler();
    this.gameState.start();
    this.gridRenderer.initialize();

    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);

    logger.info('Game', 'Game initialized successfully');
  }

  private setupClickHandler(): void {
    const gridContainer = this.gameRenderer.getGridContainer();
    const cellSize = this.gameRenderer.getCellSize();
    
    gridContainer.eventMode = 'static';
    gridContainer.on('pointerdown', (event) => {
      const localPos = event.getLocalPosition(gridContainer);
      const col = Math.floor(localPos.x / cellSize);
      const row = Math.floor(localPos.y / cellSize);
      this.gameState.handleCellClick(row, col);
    });
  }

  private handleCellUpdate(row: number, col: number): void {
    this.gridRenderer.updateCell(row, col);
  }

  private handleQueueUpdate(queue: any[]): void {
    this.queueRenderer.render(queue);
  }

  private handleGameEnd(won: boolean, pathLength: number, requiredLength: number): void {
    logger.info('Game', `Game ended: ${won ? 'Victory' : 'Defeat'}`, {
      pathLength,
      requiredLength
    });

    setTimeout(() => {
      alert(
        won
          ? `You won! Path length: ${pathLength}/${requiredLength}`
          : `You lost! Path length: ${pathLength}/${requiredLength}`
      );
      this.gameState.reset();
      this.gridRenderer.initialize();
    }, 500);
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.gameState.update(deltaTime);

    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

const game = new Game();
game.initialize().catch((error) => {
  logger.error('Game', 'Failed to initialize game', error);
  console.error(error);
});
