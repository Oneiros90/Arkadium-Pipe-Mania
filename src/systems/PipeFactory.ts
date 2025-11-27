import { Pipe } from '@/core/Pipe';
import { StraightPipe } from '@/pipes/StraightPipe';
import { CurvedPipe } from '@/pipes/CurvedPipe';
import { CrossPipe } from '@/pipes/CrossPipe';
import { Random } from '@/utils/Random';
import { PipeConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

export class PipeFactory {
  private weights: Map<string, number> = new Map();
  private totalWeight: number = 0;

  constructor(
    private random: Random,
    pipeConfigs: PipeConfig[]
  ) {
    this.initializeWeights(pipeConfigs);
  }

  private initializeWeights(configs: PipeConfig[]): void {
    configs.forEach((config) => {
      this.weights.set(config.type, config.weight);
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

  private selectRandomType(): string {
    let roll = this.random.nextFloat(0, this.totalWeight);

    for (const [type, weight] of this.weights.entries()) {
      roll -= weight;
      if (roll <= 0) {
        return type;
      }
    }

    return 'straight';
  }

  private createPipe(type: string): Pipe {
    switch (type) {
      case 'straight':
        return new StraightPipe(this.random.choice([0, 90]) as 0 | 90);
      case 'curved':
        return new CurvedPipe(this.random.choice([0, 90, 180, 270]) as 0 | 90 | 180 | 270);
      case 'cross':
        return new CrossPipe();
      default:
        return new StraightPipe(0);
    }
  }
}
