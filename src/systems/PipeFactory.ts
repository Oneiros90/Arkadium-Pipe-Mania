import { Pipe } from '@/core/Pipe';
import { PipeType } from '@/core/types';
import { Random } from '@/utils/Random';
import { PipeConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

export class PipeFactory {
  private weights: Map<PipeType, number> = new Map();
  private totalWeight: number = 0;

  constructor(
    private random: Random,
    pipeConfigs: PipeConfig[]
  ) {
    this.initializeWeights(pipeConfigs);
  }

  private initializeWeights(configs: PipeConfig[]): void {
    configs.forEach((config) => {
      this.weights.set(config.type as PipeType, config.weight);
      this.totalWeight += config.weight;
    });
    logger.debug('PipeFactory', 'Initialized pipe weights', {
      weights: Object.fromEntries(this.weights),
      totalWeight: this.totalWeight
    });
  }

  createRandomPipe(): Pipe {
    const type = this.selectRandomType();
    return this.createPipe(type);
  }

  private selectRandomType(): PipeType {
    let roll = this.random.nextFloat(0, this.totalWeight);
    
    for (const [type, weight] of this.weights.entries()) {
      roll -= weight;
      if (roll <= 0) {
        return type;
      }
    }
    
    return PipeType.Straight;
  }

  private createPipe(type: PipeType): Pipe {
    switch (type) {
      case PipeType.Straight:
        return Pipe.createStraight(this.random.choice([0, 90]) as 0 | 90);
      case PipeType.Curved:
        return Pipe.createCurved(this.random.choice([0, 90, 180, 270]) as 0 | 90 | 180 | 270);
      case PipeType.Cross:
        return Pipe.createCross();
    }
  }
}
