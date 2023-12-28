import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBufferQuadInstance } from '../geometry/GlBufferQuadInstance';
import { IQuadModel } from '../geometry/IQuadMode';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { SpriteInstanceShader } from '../shaders/SpriteInstanceShader';
import { Particle } from './Particle';

export interface EmitterArgs {
  position: vec2;
}

export class Emitter extends Component {
  emitter: EmitterArgs;
  private _quads: IQuadModel[] = [];
  private _particles: Particle[] = [];
  private buffer: GlBufferQuadInstance;
  private _timer: number;
  private _running: boolean;

  get spriteTexture(): Texture {
    return this.eng.particleManager.texture;
  }

  get shader(): SpriteInstanceShader {
    return this.eng.particleManager.shader;
  }

  get quad(): IQuadModel[] {
    return this._quads;
  }

  constructor(eng: Engine) {
    super(eng);
    this.buffer = new GlBufferQuadInstance(eng.gl);
    this._timer = 0;
  }

  initialize(options: EmitterArgs): void {
    this.emitter = options;
    this.start();
  }

  start(): void {
    this._running = true;
    this._timer = 0;
  }

  update(dt: number): void {
    if (this._running) {
    }

    this.buffer.setBuffers(this._quads);
    this.buffer.enable();
    const type = this.gl.UNSIGNED_SHORT;

    this.gl.drawElementsInstanced(
      this.gl.TRIANGLES,
      this.buffer.indexCount,
      type,
      0,
      this.buffer.instanceCount
    );
  }

  dispose(): void {
    if (this.buffer) {
      this.buffer.dispose();
      this.buffer = null;
    }
  }
}
