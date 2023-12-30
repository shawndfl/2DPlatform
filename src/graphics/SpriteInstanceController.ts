import { Component } from '../components/Component';
import { IQuadModel } from '../geometry/IQuadMode';

import { toRadian } from '../math/constants';
import mat2 from '../math/mat2';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';

import { ISprite, SpriteFlip } from './ISprite';
import { SpriteInstanceCollection } from './SpriteInstanceCollection';

/**
 * Manages a single sprite
 */
export class SpriteInstanceController extends Component implements ISprite {
  protected quad: IQuadModel;
  protected _angle: number;
  protected _scale: vec2;
  protected _flip: SpriteFlip;
  private _spriteLocationPosition: vec2 = new vec2();
  private _spriteLocationSize: vec2 = new vec2();

  constructor(
    protected _id: string,
    protected _collection: SpriteInstanceCollection
  ) {
    super(_collection.eng);
    this._angle = 0;
    this._scale = new vec2([1, 1]);
    this._flip = SpriteFlip.None;
    this.quad = {
      id: 'quad',
      translation: new vec3(0, 0, 0),
      offset: new vec2(0, 0),
      color: new vec4([1, 1, 1, 1]),
      rotScale: mat2.identity.copy(),
      maxTex: new vec2([1, 1]),
      minTex: new vec2([0, 0]),
    };
  }

  get id(): string {
    return this.quad.id;
  }
  set id(value: string) {
    this.quad.id = value;
  }
  set left(value: number) {
    this.quad.translation.x = value;
  }
  set top(value: number) {
    this.quad.translation.y = value;
  }

  spriteLocation(loc: [number, number, number, number]): void {
    this._collection.pixelsToUv(loc, this.quad.minTex, this.quad.maxTex);
  }

  get depth(): number {
    return this.quad.translation.z;
  }
  set depth(depth: number) {
    this.quad.translation.z = depth;
  }
  set leftOffset(value: number) {
    this.quad.offset.x = value;
  }
  set topOffset(value: number) {
    this.quad.offset.y = value;
  }
  get width(): number {
    if (this._collection.spriteTexture) {
      const scale = this.quad.maxTex.x - this.quad.minTex.x;
      return scale * this._collection.spriteTexture.width;
    } else {
      return 0;
    }
  }
  get height(): number {
    if (this._collection.spriteTexture) {
      const scale = this.quad.maxTex.y - this.quad.minTex.y;
      return scale * this._collection.spriteTexture.height;
    } else {
      return 0;
    }
  }
  get angle(): number {
    return this._angle;
  }
  set angle(degrees: number) {
    this._angle = degrees;
    this.calculateMat();
  }
  get xScale(): number {
    return this._scale.x;
  }
  set xScale(value: number) {
    this._scale.x = value;
    this.calculateMat();
  }
  get yScale(): number {
    return this._scale.y;
  }
  set yScale(value: number) {
    this._scale.y = value;
    this.calculateMat();
  }

  get colorScale(): Readonly<vec4> {
    return this.quad.color;
  }
  set colorScale(color: Readonly<vec4>) {
    color.copy(this.quad.color);
  }
  get alpha(): number {
    return this.colorScale.a;
  }
  set alpha(alpha: number) {
    this.quad.color.a = alpha;
  }
  get flipDirection(): SpriteFlip {
    return this._flip;
  }
  set flipDirection(flip: SpriteFlip) {
    if (this._flip == SpriteFlip.Both || this._flip == SpriteFlip.XFlip) {
      const tmp = this.quad.minTex.x;
      this.quad.minTex.x = this.quad.maxTex.x;
      this.quad.maxTex.x = tmp;
    }
    if (this._flip == SpriteFlip.Both || this._flip == SpriteFlip.YFlip) {
      const tmp = this.quad.minTex.y;
      this.quad.minTex.y = this.quad.maxTex.y;
      this.quad.maxTex.y = tmp;
    }

    this._flip =
      this.quad.minTex.x > this.quad.maxTex.x
        ? SpriteFlip.XFlip
        : SpriteFlip.None;
    this._flip =
      this._flip |
      (this.quad.minTex.y < this.quad.maxTex.y
        ? SpriteFlip.YFlip
        : SpriteFlip.None);
  }

  protected calculateMat(): void {
    this.quad.rotScale.setIdentity();

    this.quad.rotScale.rotate(toRadian(this._angle));

    const w = this._scale.x;
    const h = this._scale.y;
    this.quad.rotScale.scaleNumber(w, h);
  }

  /**
   * Get a quad from an id
   * @param id
   * @returns
   */
  getQuad(): IQuadModel {
    return this.quad;
  }

  /**
   * Removes a quad
   * @param id
   */
  removeQuad(): void {
    this._collection.removeQuad(this._id);
  }
}
