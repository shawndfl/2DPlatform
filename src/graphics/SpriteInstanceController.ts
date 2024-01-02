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
  protected _quad: IQuadModel = {
    color: vec4.one.copy(),
    id: '',
    maxTex: new vec2(),
    minTex: new vec2(),
    offset: new vec2(),
    rotScale: new mat2(),
    translation: new vec3(),
  };
  protected _angle: number = 0;
  protected _scale: vec2 = new vec2(1, 1);
  protected _flip: SpriteFlip;
  protected _loc: [number, number, number, number] = [0, 0, 0, 0];

  get quad(): IQuadModel {
    return this._quad;
  }

  get id(): string {
    return this._quad.id;
  }
  set id(value: string) {
    this._quad.id = value;
  }
  set left(value: number) {
    this.quad.translation.x = value;
    this.calculateMat();
    this._collection.setDirty();
  }
  get left(): number {
    return this.quad.translation.x;
  }

  set top(value: number) {
    this.quad.translation.y = value;
    this.calculateMat();
    this._collection.setDirty();
  }
  get top(): number {
    return this.quad.translation.y;
  }

  spriteLocation(loc: [number, number, number, number]): void {
    this._loc[0] = loc[0];
    this._loc[1] = loc[1];
    this._loc[2] = loc[2];
    this._loc[3] = loc[3];
    this._collection.pixelsToUv(
      this._loc,
      this._flip,
      this.quad.minTex,
      this.quad.maxTex
    );
    this._collection.setDirty();
  }

  get depth(): number {
    return this.quad.translation.z;
  }
  set depth(depth: number) {
    this.quad.translation.z = depth;
    this.calculateMat();
    this._collection.setDirty();
  }
  set leftOffset(value: number) {
    this.quad.offset.x = value;
    this._collection.setDirty();
  }
  set topOffset(value: number) {
    this.quad.offset.y = value;
    this._collection.setDirty();
  }
  get width(): number {
    if (this._collection.spriteTexture) {
      const scale =
        Math.abs(this.quad.maxTex.x - this.quad.minTex.x) * this._scale.x;
      return scale * this._collection.spriteTexture.width;
    } else {
      return 0;
    }
  }
  get height(): number {
    if (this._collection.spriteTexture) {
      const scale =
        Math.abs(this.quad.maxTex.y - this.quad.minTex.y) * this._scale.y;
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
    this._collection.setDirty();
  }
  get xScale(): number {
    return this._scale.x;
  }
  set xScale(value: number) {
    this._scale.x = value;
    this.calculateMat();
    this._collection.setDirty();
  }
  get yScale(): number {
    return this._scale.y;
  }
  set yScale(value: number) {
    this._scale.y = value;
    this.calculateMat();
    this._collection.setDirty();
  }
  get colorScale(): vec4 {
    return this.quad.color;
  }
  set colorScale(color: vec4) {
    this.quad.color = color;
    this._collection.setDirty();
  }
  get alpha(): number {
    return this.quad.color.a;
  }
  set alpha(alpha: number) {
    this.quad.color.a = alpha;
    this._collection.setDirty();
  }
  get flipDirection(): SpriteFlip {
    return this._flip;
  }
  set flipDirection(flip: SpriteFlip) {
    this._flip = flip;
    this._collection.pixelsToUv(
      this._loc,
      this._flip,
      this.quad.minTex,
      this.quad.maxTex
    );
    this._collection.setDirty();
  }

  constructor(
    id: string,
    protected _collection: SpriteInstanceCollection,
    quad?: IQuadModel
  ) {
    super(_collection.eng);

    if (quad) {
      this._quad = quad;
    }
    this._quad.id = id;
    this._collection.addQuad(this._quad);
  }

  protected calculateMat(): void {
    this.quad.rotScale.setIdentity();
    if (this._angle != undefined) {
      this.quad.rotScale.rotate(toRadian(this._angle));
    }

    let pixelWidth = 1;
    let pixelHeight = 1;
    if (this._collection.spriteTexture) {
      const scaleWidth = Math.abs(this.quad.maxTex.x - this.quad.minTex.x);
      pixelWidth = scaleWidth * this._collection.spriteTexture.width;
      const scaleHeight = Math.abs(this.quad.maxTex.y - this.quad.minTex.y);
      pixelHeight = scaleHeight * this._collection.spriteTexture.height;
    }

    const w = pixelWidth * this.xScale;
    const h = pixelWidth * this.yScale;
    this.quad.rotScale.scaleNumber(w, h);
  }

  /**
   * Removes a quad
   * @param id
   */
  removeSprite(): void {}
}
