import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBuffer } from '../geometry/GlBuffer';
import { GlBuffer2 } from '../geometry/GlBuffer2';
import { IQuadModel } from '../geometry/IQuadMode';
import { toRadian } from '../math/constants';
import mat4 from '../math/mat4';
import rect from '../math/rect';
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
  protected quad: IQuadModel;

  private _id: string;
  private _translate: vec3 = new vec3();
  private _depth: number;
  private _color: vec4 = new vec4();
  private _offset: vec2 = new vec2();
  private _angle: number;
  private _scale: vec2 = new vec2(1, 1);
  private _spriteLocationPosition: vec2 = new vec2();
  private _spriteLocationSize: vec2 = new vec2();
  private _flip: SpriteFlip;

  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }
  set left(value: number) {
    this._translate.x = value;
  }
  set top(value: number) {
    this._translate.y = value;
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
    this._world.scaleComp(this._scale.x, this._scale.y, 1.0);
    this._world.translate(this._translate);
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
      this.eng.spriteShader.setColorScale(this._color);

      const vertexCount = this._buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
