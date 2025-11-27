import { Cell } from '../core/Cell';
import { Position } from '../core/types';

export class EmptyCell extends Cell {
    constructor(position: Position) {
        super(position);
    }

    getTypeName(): string {
        return 'empty';
    }

    isEmpty(): boolean {
        return true;
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
