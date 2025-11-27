import { describe, it, expect, beforeEach } from 'vitest';
import { PathValidator } from '../../src/systems/PathValidator';
import { Grid } from '../../src/core/Grid';
import { StraightPipe } from '../../src/pipes/StraightPipe';
import { CurvedPipe } from '../../src/pipes/CurvedPipe';
import { Direction } from '../../src/core/types';

describe('PathValidator', () => {
  let grid: Grid;
  let validator: PathValidator;

  beforeEach(() => {
    grid = new Grid(5, 5);
    validator = new PathValidator(grid);
  });

  it('should identify start cell correctly', () => {
    grid.setStart({ row: 2, col: 2 });
    const startCell = validator.getStartCell({ row: 2, col: 2 });
    expect(startCell).toBeDefined();
    expect(startCell?.position).toEqual({ row: 2, col: 2 });
  });

  it('should return null for invalid start position', () => {
    const startCell = validator.getStartCell({ row: -1, col: -1 });
    expect(startCell).toBeNull();
  });

  it('should validate connection between start and first pipe', () => {
    grid.setStart({ row: 2, col: 2 });

    // Place a vertical straight pipe at (1,2)
    const pipe = new StraightPipe(0); // 0 rotation = vertical
    grid.placePipe({ row: 1, col: 2 }, pipe);

    const next = validator.getNextCell({ row: 2, col: 2 });

    expect(next).toBeDefined();
    expect(next?.cell.position).toEqual({ row: 1, col: 2 });
    expect(next?.entryDirection).toBe(Direction.South); // Entering from South
  });

  it('should fail if pipe is not connected', () => {
    grid.setStart({ row: 2, col: 2 });

    // Place a horizontal straight pipe at (1,2)
    const pipe = new StraightPipe(90); // 90 rotation = horizontal
    grid.placePipe({ row: 1, col: 2 }, pipe);

    const next = validator.getNextCell({ row: 2, col: 2 });
    expect(next).toBeNull();
  });

  it('should follow a path of pipes', () => {
    grid.setStart({ row: 2, col: 2 });

    const p1 = new StraightPipe(0);
    grid.placePipe({ row: 1, col: 2 }, p1);

    // Curve: South input -> East output. 
    // Rot 90: E-S (connects East and South)
    const p2 = new CurvedPipe(90);
    grid.placePipe({ row: 0, col: 2 }, p2);

    // 2,2 -> 1,2
    let next = validator.getNextCell({ row: 2, col: 2 });
    expect(next?.cell.position).toEqual({ row: 1, col: 2 });
    expect(next?.entryDirection).toBe(Direction.South);

    // Simulate water filling this cell from South
    const cell1_2 = grid.getCell({ row: 1, col: 2 });
    cell1_2?.setWaterLevel(1, Direction.South);

    // 1,2 -> 0,2
    next = validator.getNextCell({ row: 1, col: 2 });
    expect(next?.cell.position).toEqual({ row: 0, col: 2 });
    expect(next?.entryDirection).toBe(Direction.South);
  });
});
