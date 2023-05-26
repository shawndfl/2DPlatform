import { SpriteFlip } from './Sprite';

/**
 * Interface for setting a sprite
 */
export interface ISpriteController {
  /**
   * Sets the sprite
   * @param id id into the sprite sheet.
   * @param flip if the sprite should be flipped in some way.
   */
  setSprite(id: string): void;

  /**
   * Flip the sprite
   * @param flipDirection
   */
  flip(flipDirection: SpriteFlip): void;

  /**
   * Rotate sprite in degrees
   * @param angle in degrees
   */
  rotate(angle: number): void;

  /**
   * Sets the scale of the sprite keeping the aspect ratio.
   * @param scale
   */
  scale(scale: number): void;
}
