import { load } from 'js-yaml';
import { GameConfig, GameConfigSchema } from './schemas';
import { logger } from '@/utils/Logger';

export class ConfigLoader {
  private static config: GameConfig | null = null;

  static async loadFromFile(path: string): Promise<GameConfig> {
    try {
      logger.info('ConfigLoader', `Loading configuration from: ${path}`);
      
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const text = await response.text();
      const rawConfig = load(text);

      const validatedConfig = GameConfigSchema.parse(rawConfig);
      
      this.config = validatedConfig;
      logger.info('ConfigLoader', 'Configuration loaded successfully', validatedConfig);
      
      return validatedConfig;
    } catch (error) {
      logger.error('ConfigLoader', 'Failed to load configuration', error);
      return this.getDefaultConfig();
    }
  }

  static getDefaultConfig(): GameConfig {
    logger.warn('ConfigLoader', 'Using default configuration');
    return GameConfigSchema.parse({});
  }

  static getCurrentConfig(): GameConfig {
    if (!this.config) {
      return this.getDefaultConfig();
    }
    return this.config;
  }
}
