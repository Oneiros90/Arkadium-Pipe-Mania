import { Pipe } from './Pipe';
import { logger } from '@/utils/Logger';
import { Random } from '@/utils/Random';

export interface PipeStatic {
  new(...args: any[]): Pipe;
  createRandom(random: Random): Pipe;
}

/**
 * Static registry for pipe types.
 * Allows pipes to self-register, decoupling the factory from concrete implementations.
 */
export class PipeRegistry {
  private static registry: Map<string, PipeStatic> = new Map();

  /**
   * Registers a pipe type with its constructor.
   * @param type The unique type identifier for the pipe.
   * @param constructor The class constructor for the pipe.
   */
  static register(type: string, constructor: PipeStatic): void {
    console.log(`[PipeRegistry] Registering ${type}`);
    if (this.registry.has(type)) {
      logger.warn('PipeRegistry', `Overwriting existing pipe registration for type: ${type}`);
    }
    this.registry.set(type, constructor);
    logger.debug('PipeRegistry', `Registered pipe type: ${type}`);
  }

  /**
   * Creates an instance of a pipe by its type using the static createRandom method.
   * @param type The type identifier of the pipe to create.
   * @param random The random number generator instance.
   * @returns A new instance of the requested pipe.
   * @throws Error if the pipe type is not registered.
   */
  static createRandom(type: string, random: Random): Pipe {
    const Constructor = this.registry.get(type);
    if (!Constructor) {
      throw new Error(`Pipe type not registered: ${type}`);
    }
    return Constructor.createRandom(random);
  }

  /**
   * Checks if a pipe type is registered.
   * @param type The type identifier to check.
   */
  static has(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Returns a list of all registered pipe types.
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}
