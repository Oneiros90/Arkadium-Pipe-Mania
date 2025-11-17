export enum Direction {
  North = 'N',
  East = 'E',
  South = 'S',
  West = 'W'
}

export enum PipeType {
  Straight = 'straight',
  Curved = 'curved',
  Cross = 'cross'
}

export enum CellType {
  Empty = 'empty',
  Blocked = 'blocked',
  Pipe = 'pipe',
  Start = 'start'
}

export interface Position {
  row: number;
  col: number;
}
