import { Cell } from '../Cell';
import { Position } from '../types';

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
