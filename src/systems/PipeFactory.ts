import { Pipe } from '@/core/Pipe';
import { PipeRegistry } from '@/core/PipeRegistry';
import { Random } from '@/utils/Random';
import { PipeConfig } from '@/config/schemas';
import { logger } from '@/utils/Logger';

/**
 * Factory class for creating pipe instances based on configuration weights.
 */
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
      if (PipeRegistry.has(config.type)) {
        this.weights.set(config.type, config.weight);
        this.totalWeight += config.weight;
      } else {
        logger.warn('PipeFactory', `Skipping unknown pipe type in config: ${config.type}`);
      }
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

    // Fallback to first registered type or throw if empty
    const types = PipeRegistry.getRegisteredTypes();
    if (types.length > 0) {
      return types[0];
    }
    throw new Error('No pipes registered in PipeRegistry');
  }

  private createPipe(type: string): Pipe {
    try {
      if (type === 'straight') {
        return PipeRegistry.create(type, this.random.choice([0, 90]));
      } else if (type === 'curved') {
        return PipeRegistry.create(type, this.random.choice([0, 90, 180, 270]));
      } else {
        return PipeRegistry.create(type);
      }
    } catch (e) {
      logger.error('PipeFactory', `Failed to create pipe of type ${type}`, e);
      // Fallback
      return new (PipeRegistry.getRegisteredTypes().length > 0 ? PipeRegistry.getRegisteredTypes()[0] as any : Error)();
    }
  }
}
