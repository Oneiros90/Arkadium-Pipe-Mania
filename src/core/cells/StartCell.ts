import { Cell } from '../Cell';
import { Position } from '../types';

export class StartCell extends Cell {
    constructor(position: Position) {
        super(position);
    }

    getTypeName(): string {
        return 'start';
    }

    isEmpty(): boolean {
        return false;
    }

    isBlocked(): boolean {
        return false;
    }

    isStart(): boolean {
        return true;
    }

    canPlacePipe(): boolean {
        return false;
    }
}
