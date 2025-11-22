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
        // Load all resources using Pixi's Assets manager
        // Assets.load() in Pixi v8 returns Texture objects directly
        const textures = await Assets.load(paths);

        // Configure each texture for pixel art and cache
        for (const path of paths) {
            const texture = textures[path] as Texture;

            // Set pixel art rendering (no filtering)
            if (texture && texture.source) {
                texture.source.scaleMode = 'nearest';
            }

            // Cache the texture
            this.textures.set(path, texture);
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
