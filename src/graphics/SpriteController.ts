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
import { SpriteData } from './ISpriteData';
import { Texture } from './Texture';

export class SpriteController extends Component implements ISprite {
  protected _spriteTexture: Texture;
  protected _spriteData: SpriteData;
  protected _visible: boolean = true;
  protected _buffer: GlBuffer2;
  protected _dirty: boolean;
  protected _world: mat4 = new mat4();
  protected _loc: [number, number, number, number] = [0, 0, 0, 0];
  private _id: string;

  protected quad: IQuadModel = {
    color: vec4.one.copy(),
    maxTex: new vec2(),
    minTex: new vec2(),
    offset: new vec2(),
    rotScale: new mat2(),
    translation: new vec3(),
  };
  protected _angle: number = 0;
  protected _scale: vec2 = new vec2(1, 1);
  protected _flip: SpriteFlip;

  get id(): string {
    return this._id;
  }

  set left(value: number) {
    this.quad.translation.x = value;
    this.calculateMat();
    this._dirty = true;
  }
  get left(): number {
    return this.quad.translation.x;
  }

  set top(value: number) {
    this.quad.translation.y = value;
    this.calculateMat();
    this._dirty = true;
  }
  get top(): number {
    return this.quad.translation.y;
  }

  spriteImage(name: string): void {
    const data = this._spriteData.tiles.get(name);
    if (data) {
      this.spriteLocation(data.loc);
    } else {
      console.error('Cannot find sprite ' + name + ' in texture ' + this._spriteTexture.id);
    }
  }

  getSpriteImages(): string[] {
    return Array.from(this._spriteData?.tiles.keys());
  }

  spriteLocation(loc: [number, number, number, number]): void {
    this._loc[0] = loc[0];
    this._loc[1] = loc[1];
    this._loc[2] = loc[2];
    this._loc[3] = loc[3];
    this.pixelsToUv(this._loc, this._flip, this.quad.minTex, this.quad.maxTex);
    this.calculateMat();
    this._dirty = true;
  }

  get depth(): number {
    return this.quad.translation.z;
  }
  set depth(depth: number) {
    this.quad.translation.z = depth;
    this.calculateMat();
    this._dirty = true;
  }
  set leftOffset(value: number) {
    this.quad.offset.x = value;
    this._dirty = true;
  }
  set topOffset(value: number) {
    this.quad.offset.y = value;
    this._dirty = true;
  }
  get width(): number {
    if (this._spriteTexture) {
      const scale = Math.abs(this.quad.maxTex.x - this.quad.minTex.x) * this._scale.x;
      return scale * this._spriteTexture.width;
    } else {
      return 0;
    }
  }
  get height(): number {
    if (this._spriteTexture) {
      const scale = Math.abs(this.quad.maxTex.y - this.quad.minTex.y) * this._scale.y;
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
    this._dirty = true;
  }
  get xScale(): number {
    return this._scale.x;
  }
  set xScale(value: number) {
    this._scale.x = value;
    this.calculateMat();
    this._dirty = true;
  }
  get yScale(): number {
    return this._scale.y;
  }
  set yScale(value: number) {
    this._scale.y = value;
    this.calculateMat();
    this._dirty = true;
  }
  get colorScale(): vec4 {
    return this.quad.color;
  }
  set colorScale(color: vec4) {
    this.quad.color = color;
    this._dirty = true;
  }
  get alpha(): number {
    return this.quad.color.a;
  }
  set alpha(alpha: number) {
    this.quad.color.a = alpha;
    this._dirty = true;
  }
  get flipDirection(): SpriteFlip {
    return this._flip;
  }
  set flipDirection(flip: SpriteFlip) {
    this._flip = flip;
    this.pixelsToUv(this._loc, this._flip, this.quad.minTex, this.quad.maxTex);
    this._dirty = true;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
  }

  initialize(texture: Texture, spriteData: SpriteData): void {
    // save the sprite data
    this._spriteData = spriteData;

    this.dispose();

    // create the gl buffers for this sprite
    this._buffer = new GlBuffer2(this.gl);

    // setup the shader for the sprite
    this._spriteTexture = texture;

    // needs to be committed to buffer when update is called
    this._dirty = true;

    this.visible = true;
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
    this._world.scaleComp(this._scale.x * pixelWidth, this._scale.y * pixelHeight, 1.0);
    this._world.translate(this.quad.translation);
  }

  protected commitToBuffer(force?: boolean): void {
    if (this._dirty) {
      this.calculateMat();
      this._buffer.setBuffers(this.quad, false);

      this._dirty = false;
    }
  }

  update(dt: number, projection?: mat4): void {
    if (!this._visible) {
      return;
    }

    if (!this._buffer) {
      console.error('Call Initialize()');
      return;
    }

    this.commitToBuffer();

    if (!this._buffer.buffersCreated) {
      console.error('buffers are not created. Call commitToBuffers() first.');
    } else {
      this._buffer.enable();
      this.eng.spriteShader.setSpriteSheet(this._spriteTexture);
      this.eng.spriteShader.enable();

      // set the project
      const view = this.eng.viewManager;
      projection = projection ?? view.projection;
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
  pixelsToUv(loc: [number, number, number, number], flip: SpriteFlip, resultsMin: vec2, resultsMax: vec2): void {
    const sheetW = this._spriteTexture.width;
    const sheetH = this._spriteTexture.height;

    if (!loc[2]) {
      loc[2] = sheetW;
    }
    if (!loc[3]) {
      loc[3] = sheetH;
    }

    let minX = loc[0] / sheetW;
    let minY = 1.0 - loc[1] / sheetH;
    let maxX = (loc[0] + loc[2]) / sheetW;
    let maxY = 1.0 - (loc[1] + loc[3]) / sheetH;

    if (flip == SpriteFlip.Both || flip == SpriteFlip.XFlip) {
      resultsMin.x = maxX;
      resultsMax.x = minX;
    } else {
      resultsMin.x = minX;
      resultsMax.x = maxX;
    }

    if (flip == SpriteFlip.Both || flip == SpriteFlip.YFlip) {
      resultsMin.y = maxY;
      resultsMax.y = minY;
    } else {
      resultsMin.y = minY;
      resultsMax.y = maxY;
    }
  }

  /**
   * Disposes the geometry, but not the texture
   */
  dispose(): void {
    if (this._buffer) {
      this._buffer.dispose();
    }
  }
}
