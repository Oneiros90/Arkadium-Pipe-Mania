import { Sprite, Texture } from 'pixi.js';

export function createPixelArtSprite(path: string): Sprite {
  const texture = Texture.from(path);
  // Use explicit 'nearest' to satisfy Pixi typings and avoid deprecated constants
  // If the underlying resource is an HTMLImageElement, set imageRendering for canvas fallback
  try {
    texture.baseTexture.scaleMode = 'nearest' as any;
  } catch {
    // types may vary across Pixi versions; fall back to numeric 0 if assignment fails at runtime
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    texture.baseTexture.scaleMode = 0;
  }

  if (texture.baseTexture.resource && (texture.baseTexture.resource as any).style) {
    try {
      (texture.baseTexture.resource as any).style.imageRendering = 'pixelated';
    } catch {
      // ignore if not supported
    }
  }

  // Ensure baseTexture applies changes
  try {
    texture.update();
  } catch {
    // ignore if method not present
  }

  const sprite = new Sprite(texture);
  sprite.roundPixels = true;
  return sprite;
}
