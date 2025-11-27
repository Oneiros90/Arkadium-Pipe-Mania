import { Cell } from '../core/Cell';
import { Position } from '../core/types';

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
