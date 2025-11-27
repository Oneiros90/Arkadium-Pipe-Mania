import { Cell } from '../Cell';
import { Position } from '../types';

export class BlockedCell extends Cell {
    constructor(position: Position) {
        super(position);
    }

    getTypeName(): string {
        return 'blocked';
    }

    isEmpty(): boolean {
        return false;
    }

    isBlocked(): boolean {
        return true;
    }

    isStart(): boolean {
        return false;
    }

    canPlacePipe(): boolean {
        return false;
    }
}
