import { Component } from '../components/Component';
import { GlBuffer2 } from '../geometry/GlBuffer2';
import { IQuadModel } from '../geometry/IQuadMode';
import { toRadian } from '../math/constants';
import mat2 from '../math/mat2';
import mat4 from '../math/mat4';

import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { ISprite, SpriteFlip } from './ISprite';
import { Texture } from './Texture';

export class SpriteController2 extends Component implements ISprite {
  protected _spriteTexture: Texture;
  protected _buffer: GlBuffer2;
  protected _dirty: boolean;
  protected _world: mat4 = new mat4();
  protected quad: IQuadModel = {
    color: vec4.one.copy(),
    id: '',
    maxTex: new vec2(),
    minTex: new vec2(),
    offset: new vec2(),
    rotScale: new mat2(),
    translation: new vec3(),
  };

  private _id: string;
  private _angle: number = 0;
  private _scale: vec2 = new vec2(1, 1);
  private _flip: SpriteFlip;

  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }
  set left(value: number) {
    this.quad.translation.x = value;
    this.calculateMat();
  }
  get left(): number {
    return this.quad.translation.x;
  }

  set top(value: number) {
    this.quad.translation.y = value;
    this.calculateMat();
  }
  get top(): number {
    return this.quad.translation.y;
  }

  spriteLocation(loc: [number, number, number, number]): void {
    this.pixelsToUv(loc, this.quad.minTex, this.quad.maxTex);
  }
  get depth(): number {
    return this.quad.translation.z;
  }
  set depth(depth: number) {
    this.quad.translation.z = depth;
    this.calculateMat();
  }
  set leftOffset(value: number) {
    this.quad.offset.x = value;
  }
  set topOffset(value: number) {
    this.quad.offset.y = value;
  }
  get width(): number {
    if (this._spriteTexture) {
      const scale =
        Math.abs(this.quad.maxTex.x - this.quad.minTex.x) * this._scale.x;
      return scale * this._spriteTexture.width;
    } else {
      return 0;
    }
  }
  get height(): number {
    if (this._spriteTexture) {
      const scale =
        Math.abs(this.quad.maxTex.y - this.quad.minTex.y) * this._scale.y;
      return scale * this._spriteTexture.height;
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
  get colorScale(): vec4 {
    return this.quad.color;
  }
  set colorScale(color: vec4) {
    this.quad.color = color;
  }
  get alpha(): number {
    return this.quad.color.a;
  }
  set alpha(alpha: number) {
    this.quad.color.a = alpha;
  }
  get flipDirection(): SpriteFlip {
    return this._flip;
  }
  set flipDirection(flip: SpriteFlip) {
    this._flip = flip;
  }

  initialize(texture: Texture): void {
    if (this._buffer) {
      this._buffer.dispose();
    }

    // create the gl buffers for this sprite
    this._buffer = new GlBuffer2(this.gl);

    // setup the shader for the sprite
    this._spriteTexture = texture;

    // needs to be committed to buffer when update is called
    this._dirty = true;
  }

  protected calculateMat(): void {
    this._world.setIdentity();
    this._world.rotate(toRadian(this._angle), vec3.forward);
    let pixelWidth = 1;
    let pixelHeight = 1;
    if (this._spriteTexture) {
      const scaleWidth = Math.abs(this.quad.maxTex.x - this.quad.minTex.x);
      pixelWidth = scaleWidth * this._spriteTexture.width * 0.5;
      const scaleHeight = Math.abs(this.quad.maxTex.y - this.quad.minTex.y);
      pixelHeight = scaleHeight * this._spriteTexture.height * 0.5;
    }
    this._world.scaleComp(
      this._scale.x * pixelWidth,
      this._scale.y * pixelHeight,
      1.0
    );
    this._world.translate(this.quad.translation);
  }

  protected commitToBuffer(): void {
    this._buffer.setBuffers(this.quad, false);
  }

  update(dt: number): void {
    if (!this._buffer) {
      console.error('Call Initialize()');
      return;
    }

    // only commit to buffer if something changed
    if (this._dirty) {
      this.commitToBuffer();
      this._dirty = false;
    }

    if (!this._buffer.buffersCreated) {
      console.error('buffers are not created. Call commitToBuffers() first.');
    } else {
      this._buffer.enable();
      this.eng.spriteShader.setSpriteSheet(this._spriteTexture);
      this.eng.spriteShader.enable();

      // set the project
      const view = this.eng.viewManager;
      let projection = view.projection;
      this.eng.spriteShader.setProj(projection);
      this.eng.spriteShader.setWorld(this._world);
      this.eng.spriteShader.setOffset(this.quad.offset);
      this.eng.spriteShader.setColorScale(this.quad.color);

      const vertexCount = this._buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }

  /**
   * Converts textures from pixels to uv space
   * @param loc - [x, y, width, height]
   * @param spriteW
   * @param spriteH
   * @returns
   */
  pixelsToUv(
    loc: [number, number, number, number],
    resultsMin: vec2,
    resultsMax: vec2
  ): void {
    const sheetW = this._spriteTexture.width;
    const sheetH = this._spriteTexture.height;
    let minX = loc[0] / sheetW;
    let minY = 1.0 - loc[1] / sheetH;
    let maxX = (loc[0] + loc[2]) / sheetW;
    let maxY = 1.0 - (loc[1] + loc[3]) / sheetH;

    resultsMin.x = minX;
    resultsMin.y = minY;
    resultsMax.x = maxX;
    resultsMax.y = maxY;
  }
}
