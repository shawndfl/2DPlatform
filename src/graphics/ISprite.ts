import { Direction } from '../_game/components/Direction';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { SpriteFlip } from './Sprite';

export interface ISprite {
  set left(value: number);
  set top(value: number);

  /**
   * pixel position and size on the sprite sheet texture
   * If it is the full texture this will be 0,0, texture width, texture height
   */
  spriteLocation(position: vec2, size: vec2): void;

  /* dept -1 is near, 1 is far */
  get depth(): number;
  /* dept -1 is near, 1 is far */
  set depth(depth: number);

  /** offset on the quad -1 left, 1 right */
  set leftOffset(value: number);
  /** offset on the quad */
  set topOffset(value: number);

  /** the width with the scale applied in pixels */
  get width(): number;
  /** the height with the scale applied in pixels */
  get height(): number;

  get id(): string;
  set id(value: string);

  /** Get the angle in degrees */
  get angle(): number;
  set angle(degrees: number);

  get xScale(): number;
  set xScale(value: number);

  get yScale(): number;
  set yScale(value: number);

  get colorScale(): vec4;
  set colorScale(color: vec4);

  get alpha(): number;
  set alpha(color: number);

  get flipDirection(): SpriteFlip;
  set flipDirection(flip: SpriteFlip);
}
