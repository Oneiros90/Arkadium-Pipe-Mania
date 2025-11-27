import { Grid } from '@/core/Grid';
import { Position, Direction } from '@/core/types';
import { Random } from '@/utils/Random';
import { GameConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

/**
 * Initializes the grid with blocked cells and a start position.
 */
export class GridInitializer {
  constructor(
    private grid: Grid,
    private random: Random,
    private config: GameConfig
  ) { }

  initialize(): Position {
    this.placeBlockedCells();
    const startPos = this.selectStartPosition();
    this.grid.setStart(startPos);

    logger.info('GridInitializer', 'Grid initialized', {
      startPosition: startPos,
      gridSize: `${this.grid.width}x${this.grid.height}`
    });

    return startPos;
  }

  private placeBlockedCells(): void {
    const totalCells = this.grid.width * this.grid.height;
    const blockedCount = Math.floor(totalCells * this.config.gameplay.blockRatio);

    let placed = 0;
    while (placed < blockedCount) {
      const row = this.random.nextInt(0, this.grid.height - 1);
      const col = this.random.nextInt(0, this.grid.width - 1);
      const cell = this.grid.getCell({ row, col });

      if (cell && cell.isEmpty) {
        this.grid.setBlocked({ row, col });
        placed++;
      }
    }

    logger.debug('GridInitializer', `Placed ${placed} blocked cells`);
  }

  private selectStartPosition(): Position {
    const maxRow = this.grid.height - 2;

    while (true) {
      const row = this.random.nextInt(0, maxRow);
      const col = this.random.nextInt(0, this.grid.width - 1);

      const cell = this.grid.getCell({ row, col });
      const cellBelow = this.grid.getNeighbor({ row, col }, Direction.South);

      if (cell && cell.isEmpty && cellBelow && !cellBelow.isBlocked) {
        return { row, col };
      }
    }
  }
}
