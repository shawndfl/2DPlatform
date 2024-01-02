import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBufferQuadInstance } from '../geometry/GlBufferQuadInstance';
import { IQuadModel } from '../geometry/IQuadMode';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../graphics/SpriteInstanceController';
import { Texture } from '../graphics/Texture';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { SpriteInstanceShader } from '../shaders/SpriteInstanceShader';
import { Particle } from './Particle';

export interface EmitterArgs {
  position: vec2;
}

export class Emitter extends Component {
  emitter: EmitterArgs;
  private _sprites: SpriteInstanceCollection;
  private active: SpriteInstanceController[] = [];
  private inactive: SpriteInstanceController[] = [];

  private _timer: number;
  private _running: boolean;

  /** emitter's position */
  position: vec2 = new vec2();

  /** the number of particles that are emitted */
  maxParticles: number = 20;

  get spriteTexture(): Texture {
    return this.eng.particleManager.texture;
  }

  get shader(): SpriteInstanceShader {
    return this.eng.particleManager.shader;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sprites = new SpriteInstanceCollection(this.eng);
    this._timer = 0;
  }

  initialize(options: EmitterArgs): void {
    this.emitter = options;

    // set the texture
    const spriteTexture = this.eng.assetManager.getSprite('enemies.particle.1');
    this._sprites.setTexture(spriteTexture.texture);

    // set the particles
    this.active = [];
    this.inactive = [];
    this._sprites.clear();

    this.position = options.position;

    // create the particles
    for (let i = 0; i < this.maxParticles; i++) {
      const spriteController = new SpriteInstanceController(
        'p_' + i,
        this._sprites
      );
      const scale = 0.5;
      spriteController.spriteLocation(spriteTexture.tile.loc);
      spriteController.angle = 0;
      spriteController.colorScale = new vec4([0, 1, 0, 1]);
      spriteController.alpha = 0.5;
      spriteController.topOffset = 0.5;
      spriteController.leftOffset = 0.5;
      spriteController.depth = -0.8;
      spriteController.xScale = scale;
      spriteController.yScale = scale;

      spriteController.left = this.position.x; //  - scale / 2;
      spriteController.top = this.position.y; // - scale / 2;

      this.active.push(spriteController);

      // create a box around the center of the emitter
      this.eng.annotationManager.buildRect(
        'emiter1',
        new rect([
          spriteController.left,
          spriteController.width,
          spriteController.top + spriteController.height,
          spriteController.height,
        ]),
        new vec4([0, 0.5, 0.3, 1])
      );
    }

    this.start();
  }

  start(): void {
    this._running = true;
    this._timer = 0;
  }

  update(dt: number): void {
    if (this._running) {
      this._sprites.update(dt);
    }
  }

  dispose(): void {}
}
