import { Emitter, EmitterArgs } from '../particle/Emitter';
import { Engine } from '../core/Engine';
import { Component } from '../components/Component';
import { SpriteInstanceShader } from '../shaders/SpriteInstanceShader';
import { Texture } from '../graphics/Texture';

export class ParticleManager extends Component {
  private _shader: SpriteInstanceShader;
  private _spriteTexture: Texture;

  emitter: Map<string, Emitter>;

  get shader(): SpriteInstanceShader {
    return this._shader;
  }

  get texture(): Texture {
    return this._spriteTexture;
  }

  constructor(eng: Engine) {
    super(eng);
    this.emitter = new Map<string, Emitter>();
    this._shader = new SpriteInstanceShader(eng.gl, 'instancing');
  }

  /**
   * Add an emitter
   * @param name
   * @param options
   */
  setEmitter(name: string, options: EmitterArgs): Emitter {
    let emitter = this.emitter.get(name);
    if (!emitter) {
      emitter = new Emitter(this.eng);
      this.emitter.set(name, emitter);
    }
    emitter.initialize(options);
    return emitter;
  }

  /**
   * Remove the emitter
   * @param name
   */
  removeEmitter(name: string): void {
    let emitter = this.emitter.get(name);
    if (emitter) {
      emitter.dispose();
      this.emitter.delete(name);
    }
  }

  setTexture(spriteTexture: Texture): void {
    this._spriteTexture = spriteTexture;
  }

  initialize(): void {}

  update(dt: number): void {
    const view = this.eng.viewManager;
    let projection = view.projection;

    this.shader.setSpriteSheet(this._spriteTexture);
    this.shader.enable();
    // set the project
    this.shader.setProj(projection);

    this.emitter.forEach((e) => e.update(dt));
  }
}
