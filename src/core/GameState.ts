import { Grid } from '@/core/Grid';
import { Pipe } from '@/core/Pipe';
import { Position } from '@/core/types';
import { GameConfig, VisualConfig } from '@/config/schemas';
import { Random } from '@/utils/Random';
import { GridInitializer } from '@/systems/GridInitializer';
import { PipeFactory } from '@/systems/PipeFactory';
import { PathValidator } from '@/systems/PathValidator';
import { FlowSystem } from '@/systems/FlowSystem';
import { logger } from '@/utils/Logger';

export class GameState {
  private grid: Grid;
  private random: Random;
  private pipeFactory: PipeFactory;
  private gridInitializer: GridInitializer;
  private pathValidator: PathValidator;
  private flowSystem: FlowSystem;

  private startPosition!: Position;
  private pipeQueue: Pipe[] = [];
  private requiredPathLength: number = 0;
  private gameTimer: number = 0;
  private timerRunning: boolean = false;

  constructor(
    private config: GameConfig,
    private visualConfig: VisualConfig,
    private onCellUpdate: (row: number, col: number) => void,
    private onQueueUpdate: (queue: Pipe[]) => void,
    private onGameEnd: (won: boolean, pathLength: number, requiredLength: number) => void
  ) {
    this.grid = new Grid(config.grid.width, config.grid.height);
    this.random = new Random(config.seed);
    this.pipeFactory = new PipeFactory(this.random, config.pipes);
    this.gridInitializer = new GridInitializer(this.grid, this.random, config);
    this.pathValidator = new PathValidator(this.grid);
    this.flowSystem = new FlowSystem(
      this.pathValidator,
      config,
      this.handleCellFilled.bind(this),
      this.handleGameEnd.bind(this)
    );

    logger.info('GameState', 'Game initialized', {
      seed: this.random.getSeed()
    });
  }

  start(): void {
    this.startPosition = this.gridInitializer.initialize();
    this.requiredPathLength = this.random.nextInt(
      this.config.gameplay.minPathLength.min,
      this.config.gameplay.minPathLength.max
    );

    this.fillPipeQueue();
    this.notifyGridUpdate();

    logger.info('GameState', 'Game started', {
      startPosition: this.startPosition,
      requiredPathLength: this.requiredPathLength
    });
  }

  private fillPipeQueue(): void {
    this.pipeQueue = [];
    for (let i = 0; i < this.visualConfig.grid.queueSize; i++) {
      this.pipeQueue.push(this.pipeFactory.createRandomPipe());
    }
    this.onQueueUpdate(this.pipeQueue);
  }

  update(deltaTime: number): void {
    if (this.timerRunning) {
      this.gameTimer += deltaTime;
      if (this.gameTimer >= this.config.gameplay.placementDelay && !this.flowSystem.isActive()) {
        this.startWaterFlow();
      }
    }
    if (this.flowSystem.isActive()) {
      this.flowSystem.update(deltaTime);
    }
  }

  private startWaterFlow(): void {
    logger.info('GameState', 'Starting water flow', {
      gameTimer: this.gameTimer,
      placementDelay: this.config.gameplay.placementDelay
    });
    this.flowSystem.start(this.startPosition);
  }

  handleCellClick(row: number, col: number): void {
    const position: Position = { row, col };
    const cell = this.grid.getCell(position);

    if (!cell || !cell.canPlacePipe()) {
      return;
    }

    const pipe = this.pipeQueue.shift();
    if (!pipe) {
      return;
    }

    this.grid.placePipe(position, pipe);
    this.onCellUpdate(row, col);

    this.pipeQueue.push(this.pipeFactory.createRandomPipe());
    this.onQueueUpdate(this.pipeQueue);

    logger.debug('GameState', 'Pipe placed', { position, pipeType: pipe.type });

    if (!this.timerRunning) {
      this.startGameTimer();
    }
  }

  startGameTimer(): void {
    this.timerRunning = true;
    this.gameTimer = 0;
    logger.info('GameState', 'Game timer started');
  }

  private handleCellFilled(row: number, col: number): void {
    this.onCellUpdate(row, col);
  }

  private handleGameEnd(pathLength: number): void {
    this.timerRunning = false;
    const won = pathLength >= this.requiredPathLength;
    this.onGameEnd(won, pathLength, this.requiredPathLength);
  }

  getGrid(): Grid {
    return this.grid;
  }

  getRequiredPathLength(): number {
    return this.requiredPathLength;
  }

  getCurrentPathLength(): number {
    return this.pathValidator.getPathLength(this.startPosition) - 1;
  }

  reset(): void {
    this.grid.reset();
    this.flowSystem.reset();
    this.pipeQueue = [];
    this.gameTimer = 0;
    this.timerRunning = false;
    this.start();
  }

  private notifyGridUpdate(): void {
    this.grid.forEachCell((cell) => {
      this.onCellUpdate(cell.position.row, cell.position.col);
    });
  }
}
