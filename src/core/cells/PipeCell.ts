import { Cell } from '../Cell';
import { Position } from '../types';
import { Pipe } from '../Pipe';

export class PipeCell extends Cell {
    constructor(position: Position, pipe: Pipe) {
        super(position);
        this.pipe = pipe;
    }

    getTypeName(): string {
        return 'pipe';
    }

    isEmpty(): boolean {
        return false;
    }

    isBlocked(): boolean {
        return false;
    }

    isStart(): boolean {
        return false;
    }

    canPlacePipe(): boolean {
        return this.waterFlows.length === 0;
    }
}
