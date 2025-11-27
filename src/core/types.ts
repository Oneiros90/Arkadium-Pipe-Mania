/**
 * Cardinal directions for pipe connections and movement.
 */
export enum Direction {
  North = 'N',
  East = 'E',
  South = 'S',
  West = 'W'
}

/**
 * Coordinates in the grid (row, col).
 */
export interface Position {
  row: number;
  col: number;
}
