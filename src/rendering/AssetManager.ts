import { Assets, Texture } from 'pixi.js';

/**
 * Centralized asset manager for Pixi v8.
 * Handles loading and caching of textures with proper TextureSource usage.
 */
export class AssetManager {
  private textures: Map<string, Texture> = new Map();

  /**
   * Load specific asset paths.
   */
  async loadAssets(paths: string[]): Promise<void> {
    // Prepend BASE_URL to paths for correct resolution in all environments
    const basePath = import.meta.env.BASE_URL;
    const fullPaths = paths.map(path =>
      path.startsWith('/') ? `${basePath}${path.substring(1)}` : path
    );

    // Load all resources using Pixi's Assets manager
    const textures = await Assets.load(fullPaths);

    // Configure each texture for pixel art and cache with original path as key
    for (let i = 0; i < paths.length; i++) {
      const originalPath = paths[i];
      const fullPath = fullPaths[i];
      const texture = textures[fullPath] as Texture;

      // Set pixel art rendering (no filtering)
      if (texture && texture.source) {
        texture.source.scaleMode = 'nearest';
      }

      // Cache the texture with original path as key
      this.textures.set(originalPath, texture);
    }
  }

  /**
   * Get a cached texture by its path.
   * Throws if texture not found (should be loaded upfront).
   */
  getTexture(path: string): Texture {
    const texture = this.textures.get(path);
    if (!texture) {
      throw new Error(`Texture not loaded: ${path}`);
    }
    return texture;
  }

  /**
   * Check if a texture is loaded.
   */
  hasTexture(path: string): boolean {
    return this.textures.has(path);
  }

  /**
   * Clear all cached textures (cleanup).
   */
  clear(): void {
    for (const texture of this.textures.values()) {
      texture.destroy(true); // destroy source too
    }
    this.textures.clear();
  }
}
