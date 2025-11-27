import { describe, it, expect, beforeEach } from 'vitest';
import { GridInitializer } from '../../src/systems/GridInitializer';
import { Grid } from '../../src/core/Grid';
import { Random } from '../../src/utils/Random';
import { GameConfig } from '../../src/config/schemas';

describe('GridInitializer', () => {
  let grid: Grid;
  let random: Random;
  let config: GameConfig;
  let initializer: GridInitializer;

  beforeEach(() => {
    grid = new Grid(9, 7);
    random = new Random(12345);
    config = {
      gameplay: {
        blockRatio: 0.1
      }
    } as any;
    initializer = new GridInitializer(grid, random, config);
  });

  it('should place blocked cells', () => {
    initializer.initialize();
    let blockedCount = 0;
    grid.forEachCell(cell => {
      if (cell.isBlocked) blockedCount++;
    });
    // 9*7 = 63. 0.1 * 63 = 6.3 -> 6 blocked cells.
    expect(blockedCount).toBe(6);
  });

  it('should select a valid start position', () => {
    const startPos = initializer.initialize();
    const startCell = grid.getCell(startPos);

    expect(startCell).toBeDefined();
    expect(startCell?.isStart).toBe(true);

    // Should not be on last row (index 6)
    expect(startPos.row).toBeLessThan(6);

    // Cell below should not be blocked
    const cellBelow = grid.getCell({ row: startPos.row + 1, col: startPos.col });
    expect(cellBelow?.isBlocked).toBe(false);
  });
});
