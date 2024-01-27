import { Direction } from '../_game/components/Direction';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

export enum SpriteFlip {
  None = 0x0,
  XFlip = 0x1,
  YFlip = 0x2,
  Both = XFlip | YFlip,
}

/**
 * This is the main interface into a sprite
 */
export interface ISprite {
  get id(): string;
  set id(value: string);

  /** x position in pixels */
  set left(value: number);
  /** y position in pixels */
  set top(value: number);

  /**
   * pixel position and size on the sprite sheet texture
   * If it is the full texture this will be 0,0, texture width, texture height
   * @param loc - array [x, y, width, height]
   */
  spriteLocation(loc: [number, number, number, number]): void;

  /**
   * Sets the sprite image to a given name
   * @param name
   */
  spriteImage(name: string): void;

  /**
   * Returns a list of valid names that can be used
   */
  getSpriteImages(): string[];

  /* dept -1 is near, 1 is far */
  get depth(): number;

  /* dept -1 is near, 1 is far */
  set depth(depth: number);

  /** offset on the quad -1 right, 1 left */
  set leftOffset(value: number);

  /** offset on the quad -1 top, 1 bottom  */
  set topOffset(value: number);

  /** the width with the scale applied in pixels */
  get width(): number;
  /** the height with the scale applied in pixels */
  get height(): number;

  /** Get the angle in degrees */
  get angle(): number;
  set angle(degrees: number);

  get xScale(): number;
  set xScale(value: number);

  get yScale(): number;
  set yScale(value: number);

  get colorScale(): Readonly<vec4>;
  set colorScale(color: Readonly<vec4>);

  get alpha(): number;
  set alpha(alpha: number);

  get flipDirection(): SpriteFlip;
  set flipDirection(flip: SpriteFlip);

  get visible(): boolean;
  set visible(value: boolean);
}
