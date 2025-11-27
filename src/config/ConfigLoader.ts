import { load } from 'js-yaml';
import { GameConfig, GameConfigSchema, VisualConfig, VisualConfigSchema } from './schemas';
import { logger } from '@/utils/Logger';

/**
 * Handles loading and parsing of game and visual configurations.
 */
export class ConfigLoader {
  private static config: GameConfig | null = null;
  private static visualConfig: VisualConfig | null = null;

  static async loadFromFile(path: string): Promise<GameConfig> {
    try {
      // Use window.location to build correct path for GitHub Pages
      const basePath = document.querySelector('base')?.getAttribute('href') || '/';
      const fullPath = path.startsWith('/') ? `${basePath}${path.substring(1)}` : path;

      logger.info('ConfigLoader', `Loading configuration from: ${fullPath}`);

      const response = await fetch(fullPath);
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

  static async loadVisualConfig(path: string): Promise<VisualConfig> {
    try {
      // Use window.location to build correct path for GitHub Pages
      const basePath = document.querySelector('base')?.getAttribute('href') || '/';
      const fullPath = path.startsWith('/') ? `${basePath}${path.substring(1)}` : path;

      logger.info('ConfigLoader', `Loading visual configuration from: ${fullPath}`);

      const response = await fetch(fullPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch visual config: ${response.statusText}`);
      }

      const text = await response.text();
      const rawConfig = load(text);

      const validatedConfig = VisualConfigSchema.parse(rawConfig);

      this.visualConfig = validatedConfig;
      logger.info('ConfigLoader', 'Visual configuration loaded successfully', validatedConfig);

      return validatedConfig;
    } catch (error) {
      logger.error('ConfigLoader', 'Failed to load visual configuration', error);
      return this.getDefaultVisualConfig();
    }
  }

  static getDefaultConfig(): GameConfig {
    logger.warn('ConfigLoader', 'Using default configuration');
    return GameConfigSchema.parse({});
  }

  static getDefaultVisualConfig(): VisualConfig {
    logger.warn('ConfigLoader', 'Using default visual configuration');
    return VisualConfigSchema.parse({});
  }

  static getCurrentConfig(): GameConfig {
    if (!this.config) {
      return this.getDefaultConfig();
    }
    return this.config;
  }

  static getCurrentVisualConfig(): VisualConfig {
    if (!this.visualConfig) {
      return this.getDefaultVisualConfig();
    }
    return this.visualConfig;
  }
}
