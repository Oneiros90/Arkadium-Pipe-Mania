import { Application, Container, Graphics } from 'pixi.js';
import { Grid } from '@/core/Grid';
import { Pipe } from '@/core/Pipe';
import { CellType, Direction } from '@/core/types';
import { GridRenderer } from '@/rendering/GridRenderer';
import { ConfigLoader } from '@/config/ConfigLoader';
import { VisualConfig } from '@/config/schemas';

interface TestPipeConfig {
  pipe: Pipe;
  waterDirections: Direction[];
  label: string;
}

class TestGrid {
  private app: Application;
  private container: Container;
  private grid: Grid;
  private renderer!: GridRenderer;
  private cellSize = 80;
  private testConfigs: TestPipeConfig[] = [];
  private animationPhase = 0;
  private tooltip: HTMLDivElement;
  private cols = 6;
  private flowSpeed = 0.3;
  private visualConfig!: VisualConfig;

  constructor(private rootElement: HTMLElement) {
    this.app = new Application();
    this.container = new Container();
    this.grid = new Grid(0, 0);
    this.tooltip = this.createTooltip();
  }

  async initialize(): Promise<void> {
    this.visualConfig = await ConfigLoader.loadVisualConfig('/config/visual.yaml');
    this.setupTestConfigs();
    
    const rows = Math.ceil(this.testConfigs.length / this.cols);
    
    this.grid = new Grid(this.cols, rows);

    const width = this.cols * this.cellSize + 40;
    const height = rows * this.cellSize + 40;

    await this.app.init({
      width,
      height,
      backgroundColor: 0x1a1a1a,
      antialias: true
    });

    this.rootElement.appendChild(this.app.canvas);

    this.container.x = 20;
    this.container.y = 20;
    this.app.stage.addChild(this.container);

    const bg = new Graphics();
    bg.rect(0, 0, this.cols * this.cellSize, rows * this.cellSize);
    bg.fill(0x2a2a2a);
    this.container.addChild(bg);

    this.renderer = new GridRenderer(this.container, this.grid, this.visualConfig);

    this.populateTestGrid(this.cols);
    this.renderer.initialize();
    this.setupMouseEvents();

    this.app.ticker.add((ticker) => this.animate(ticker.deltaMS / 1000));
  }

  private createTooltip(): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    return tooltip;
  }

  private setupMouseEvents(): void {
    const canvas = this.app.canvas;
    
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - this.container.x;
      const y = e.clientY - rect.top - this.container.y;
      
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);
      
      if (col >= 0 && col < this.cols && row >= 0 && row < Math.ceil(this.testConfigs.length / this.cols)) {
        const index = row * this.cols + col;
        if (index < this.testConfigs.length) {
          const config = this.testConfigs[index];
          this.tooltip.textContent = `${config.label} | Row: ${row}, Col: ${col}`;
          this.tooltip.style.display = 'block';
          this.tooltip.style.left = `${e.clientX + 15}px`;
          this.tooltip.style.top = `${e.clientY + 15}px`;
        } else {
          this.tooltip.style.display = 'none';
        }
      } else {
        this.tooltip.style.display = 'none';
      }
    });
    
    canvas.addEventListener('mouseleave', () => {
      this.tooltip.style.display = 'none';
    });
  }

  private setupTestConfigs(): void {
    this.testConfigs = [
      { pipe: Pipe.createStraight(0), waterDirections: [Direction.North], label: 'Straight V (N->S)' },
      { pipe: Pipe.createStraight(0), waterDirections: [Direction.South], label: 'Straight V (S->N)' },
      { pipe: Pipe.createStraight(90), waterDirections: [Direction.East], label: 'Straight H (E->W)' },
      { pipe: Pipe.createStraight(90), waterDirections: [Direction.West], label: 'Straight H (W->E)' },
      
      { pipe: Pipe.createCurved(0), waterDirections: [Direction.North], label: 'Curved NE (N->E)' },
      { pipe: Pipe.createCurved(0), waterDirections: [Direction.East], label: 'Curved NE (E->N)' },
      { pipe: Pipe.createCurved(90), waterDirections: [Direction.East], label: 'Curved ES (E->S)' },
      { pipe: Pipe.createCurved(90), waterDirections: [Direction.South], label: 'Curved ES (S->E)' },
      { pipe: Pipe.createCurved(180), waterDirections: [Direction.South], label: 'Curved SW (S->W)' },
      { pipe: Pipe.createCurved(180), waterDirections: [Direction.West], label: 'Curved SW (W->S)' },
      { pipe: Pipe.createCurved(270), waterDirections: [Direction.West], label: 'Curved WN (W->N)' },
      { pipe: Pipe.createCurved(270), waterDirections: [Direction.North], label: 'Curved WN (N->W)' },
      
      { pipe: Pipe.createCross(), waterDirections: [Direction.North], label: 'Cross 1st pass (N->S)' },
      { pipe: Pipe.createCross(), waterDirections: [Direction.South], label: 'Cross 1st pass (S->N)' },
      { pipe: Pipe.createCross(), waterDirections: [Direction.East], label: 'Cross 1st pass (E->W)' },
      { pipe: Pipe.createCross(), waterDirections: [Direction.West], label: 'Cross 1st pass (W->E)' },
      { pipe: Pipe.createCross(), waterDirections: [Direction.North, Direction.East], label: 'Cross both (N then E)' },
      { pipe: Pipe.createCross(), waterDirections: [Direction.South, Direction.West], label: 'Cross both (S then W)' },
    ];
  }

  private populateTestGrid(cols: number): void {
    this.testConfigs.forEach((config, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const cell = this.grid.getCell({ row, col });
      
      if (cell) {
        cell.type = CellType.Pipe;
        cell.pipe = config.pipe;
      }
    });
  }

  private animate(deltaTime: number): void {
    this.animationPhase += deltaTime * this.flowSpeed;

    this.testConfigs.forEach((config, index) => {
      const row = Math.floor(index / this.cols);
      const col = index % this.cols;
      const cell = this.grid.getCell({ row, col });
      
      if (cell && cell.pipe) {
        const cyclePhase = this.animationPhase % config.waterDirections.length;
        config.waterDirections.forEach((dir, index) => {
          const flowPhase = Math.max(0, Math.min(1, cyclePhase - index));
          cell.setWaterLevel(flowPhase, dir);
        });
        
        this.renderer.updateCell(row, col);
      }
    });
  }
}

const container = document.getElementById('game-container');
if (container) {
  const testGrid = new TestGrid(container);
  testGrid.initialize();
}
