import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FlowSystem, FlowState } from '../../src/systems/FlowSystem';
import { PathValidator } from '../../src/systems/PathValidator';
import { GameConfig } from '../../src/config/schemas';
import { Cell } from '../../src/core/Cell';
import { EmptyCell } from '../../src/cells/EmptyCell';
import { StartCell } from '../../src/cells/StartCell';
import { Direction } from '../../src/core/types';

describe('FlowSystem', () => {
  let flowSystem: FlowSystem;
  let mockValidator: any;
  let mockConfig: GameConfig;
  let mockOnCellUpdate: any;
  let mockOnGameEnd: any;

  beforeEach(() => {
    mockValidator = {
      getStartCell: vi.fn(),
      getNextCell: vi.fn()
    };

    mockConfig = {
      gameplay: {
        flowSpeed: 1, // 1 cell per second
        blockRatio: 0,
        minPathLength: { min: 5, max: 10 },
        placementDelay: 0
      }
    } as any;

    mockOnCellUpdate = vi.fn();
    mockOnGameEnd = vi.fn();

    flowSystem = new FlowSystem(
      mockValidator as PathValidator,
      mockConfig,
      mockOnCellUpdate,
      mockOnGameEnd
    );
  });

  it('should start in Idle state', () => {
    expect(flowSystem.getState()).toBe(FlowState.Idle);
  });

  it('should transition to Flowing when started', () => {
    const startCell = new StartCell({ row: 0, col: 0 });
    mockValidator.getStartCell.mockReturnValue(startCell);
    mockValidator.getNextCell.mockReturnValue({ cell: new EmptyCell({ row: 0, col: 1 }), entryDirection: Direction.West });

    flowSystem.start({ row: 0, col: 0 });
    expect(flowSystem.getState()).toBe(FlowState.Flowing);
  });

  it('should update cell progress over time', () => {
    const startCell = new StartCell({ row: 0, col: 0 });
    // Mock getStartCell to return our cell
    mockValidator.getStartCell.mockReturnValue(startCell);
    // Mock getNextCell to return something so it doesn't end immediately
    mockValidator.getNextCell.mockReturnValue({ cell: new EmptyCell({ row: 0, col: 1 }), entryDirection: Direction.West });

    flowSystem.start({ row: 0, col: 0 });

    // Update for 0.5 seconds. Speed is 1. Progress should be 0.5.
    flowSystem.update(0.5);

    // Check if onCellUpdate was called
    // FlowSystem immediately advances to the first pipe (0,1)
    expect(mockOnCellUpdate).toHaveBeenCalledWith(0, 1);
  });

  it('should advance to next cell when full', () => {
    const cell1 = new StartCell({ row: 0, col: 0 });
    const cell2 = new EmptyCell({ row: 0, col: 1 });

    mockValidator.getStartCell.mockReturnValue(cell1);
    mockValidator.getNextCell
      .mockReturnValueOnce({ cell: cell2, entryDirection: Direction.West }) // First call for start
      .mockReturnValueOnce({ cell: new EmptyCell({ row: 0, col: 2 }), entryDirection: Direction.West }); // Second call for next

    flowSystem.start({ row: 0, col: 0 });

    // Update 1.1 seconds -> should fill cell1 and move to cell2
    flowSystem.update(1.1);

    expect(mockOnCellUpdate).toHaveBeenCalledWith(0, 1); // Should be updating cell2 now
  });

  it('should end game if no next cell', () => {
    const startCell = new StartCell({ row: 0, col: 0 });
    mockValidator.getStartCell.mockReturnValue(startCell);
    mockValidator.getNextCell.mockReturnValue(null); // No next cell

    flowSystem.start({ row: 0, col: 0 });

    expect(mockOnGameEnd).toHaveBeenCalled();
    expect(flowSystem.getState()).toBe(FlowState.End);
  });
});
