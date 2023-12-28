import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { ISprite, SpriteFlip } from './ISprite';

export class SpriteController2 implements ISprite {
  private _id: string;
  private bounds: rect;
  private _depth: number;
  private _color: vec4;
  private _offset: vec2;
  private _angle: number;
  private _scale: vec2;
  private _spriteLocationPosition: vec2;
  private _spriteLocationSize: vec2;
  private _flip: SpriteFlip;

  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }
  set left(value: number) {
    this.bounds.left = value;
  }
  set top(value: number) {
    this.bounds.top = value;
  }
  spriteLocation(position: vec2, size: vec2): void {
    this._spriteLocationPosition = position;
    this._spriteLocationSize = size;
  }
  get depth(): number {
    return this._depth;
  }
  set depth(depth: number) {
    this._depth = depth;
  }
  set leftOffset(value: number) {
    this._offset.x = value;
  }
  set topOffset(value: number) {
    this._offset.y = value;
  }
  get width(): number {
    return this._spriteLocationSize.x * this._scale.x;
  }
  get height(): number {
    return this._spriteLocationSize.y * this._scale.y;
  }
  get angle(): number {
    return this._angle;
  }
  set angle(degrees: number) {
    this._angle = degrees;
  }
  get xScale(): number {
    return this._scale.x;
  }
  set xScale(value: number) {
    this._scale.x = value;
  }
  get yScale(): number {
    return this._scale.y;
  }
  set yScale(value: number) {
    this._scale.y = value;
  }
  get colorScale(): vec4 {
    return this._color;
  }
  set colorScale(color: vec4) {
    this._color = color;
  }
  get alpha(): number {
    return this._color.a;
  }
  set alpha(alpha: number) {
    this._color.a = alpha;
  }
  get flipDirection(): SpriteFlip {
    return this._flip;
  }
  set flipDirection(flip: SpriteFlip) {
    this._flip = flip;
  }
}
