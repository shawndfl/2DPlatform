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
    maxTex: new vec2(),
    minTex: new vec2(),
    offset: new vec2(),
    rotScale: new mat2(),
    translation: new vec3(),
  };
  private _id: string;
  protected _angle: number = 0;
  protected _scale: vec2 = new vec2(1, 1);
  protected _flip: SpriteFlip;
  protected _loc: [number, number, number, number] = [0, 0, 0, 0];

  get id(): string {
    return this._id;
  }

  set left(value: number) {
    this._quad.translation.x = value;
    this.calculateMat();
    this.updateCollection();
  }
  get left(): number {
    return this._quad.translation.x;
  }

  set top(value: number) {
    this._quad.translation.y = value;
    this.calculateMat();
    this.updateCollection();
  }
  get top(): number {
    return this._quad.translation.y;
  }

  spriteImage(name: string): void {
    const data = this._collection.spriteData.tiles.get(name);
    if (data) {
      this.spriteLocation(data.loc);
    } else {
      console.error('Cannot find sprite ' + name + ' in texture ' + this._collection.spriteTexture.id);
    }
  }

  getSpriteImages(): string[] {
    return Array.from(this._collection.spriteData?.tiles.keys());
  }

  spriteLocation(loc: [number, number, number, number]): void {
    this._loc[0] = loc[0];
    this._loc[1] = loc[1];
    this._loc[2] = loc[2];
    this._loc[3] = loc[3];
    this._collection.pixelsToUv(this._loc, this._flip, this._quad.minTex, this._quad.maxTex);
    this.updateCollection();
  }

  get depth(): number {
    return this._quad.translation.z;
  }
  set depth(depth: number) {
    this._quad.translation.z = depth;
    this.calculateMat();
    this.updateCollection();
  }
  set leftOffset(value: number) {
    this._quad.offset.x = value;
    this.updateCollection();
  }
  set topOffset(value: number) {
    this._quad.offset.y = value;
    this.updateCollection();
  }
  get width(): number {
    if (this._collection.spriteTexture) {
      const scale = Math.abs(this._quad.maxTex.x - this._quad.minTex.x); // * this._scale.x;
      return scale * this._collection.spriteTexture.width;
    } else {
      return 0;
    }
  }
  get height(): number {
    if (this._collection.spriteTexture) {
      const scale = Math.abs(this._quad.maxTex.y - this._quad.minTex.y); // * this._scale.y;
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
    this.updateCollection();
  }
  get xScale(): number {
    return this._scale.x;
  }
  set xScale(value: number) {
    this._scale.x = value;
    this.calculateMat();
    this.updateCollection();
  }
  get yScale(): number {
    return this._scale.y;
  }
  set yScale(value: number) {
    this._scale.y = value;
    this.calculateMat();
    this.updateCollection();
  }
  get colorScale(): vec4 {
    return this._quad.color;
  }
  set colorScale(color: vec4) {
    this._quad.color = color;
    this.updateCollection();
  }
  get alpha(): number {
    return this._quad.color.a;
  }
  set alpha(alpha: number) {
    this._quad.color.a = alpha;
    this.updateCollection();
  }
  get flipDirection(): SpriteFlip {
    return this._flip;
  }
  set flipDirection(flip: SpriteFlip) {
    this._flip = flip;
    this._collection.pixelsToUv(this._loc, this._flip, this._quad.minTex, this._quad.maxTex);
    this.updateCollection();
  }

  get visible(): boolean {
    return this._collection.hasQuad(this.id);
  }
  /**
   *sets the visibility
   * @param id
   */
  set visible(value: boolean) {
    if (value) {
      this._collection.addQuad(this.id, this._quad);
    } else {
      this._collection.removeQuad(this.id);
    }
  }

  constructor(id: string, protected _collection: SpriteInstanceCollection, quad?: IQuadModel) {
    super(_collection.eng);

    if (quad) {
      quad.color.copy(this._quad.color);
      quad.maxTex.copy(this._quad.maxTex);
      quad.minTex.copy(this._quad.minTex);
      quad.offset.copy(this._quad.offset);
      quad.rotScale.copy(this._quad.rotScale);
      quad.translation.copy(this._quad.translation);
    }
    this._id = id;

    this.visible = true;
  }

  protected calculateMat(): void {
    this._quad.rotScale.setIdentity();
    if (this._angle != undefined) {
      this._quad.rotScale.rotate(toRadian(this._angle));
    }

    let pixelWidth = 1;
    let pixelHeight = 1;
    if (this._collection.spriteTexture) {
      const scaleWidth = Math.abs(this._quad.maxTex.x - this._quad.minTex.x);
      pixelWidth = scaleWidth * this._collection.spriteTexture.width;
      const scaleHeight = Math.abs(this._quad.maxTex.y - this._quad.minTex.y);
      pixelHeight = scaleHeight * this._collection.spriteTexture.height;
    }

    const w = pixelWidth * this.xScale;
    const h = pixelHeight * this.yScale;
    this._quad.rotScale.scaleNumber(w, h);
  }

  updateCollection(): void {
    this._collection.setDirty();
  }

  getSprite(id: string): IQuadModel {
    return this._collection.getQuad(id);
  }
}
