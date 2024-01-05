import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBufferQuadInstance } from '../geometry/GlBufferQuadInstance';
import { IQuadModel } from '../geometry/IQuadMode';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../graphics/SpriteInstanceController';
import { Texture } from '../graphics/Texture';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { RidgeBody } from '../physics/RidgeBody';
import { SpriteInstanceShader } from '../shaders/SpriteInstanceShader';
import { ISpriteTexture } from '../systems/AssetManager';
import { MetersToPixels, PixelsToMeters } from '../systems/PhysicsManager';
import { Particle, ParticleCreationArgs } from './Particle';

export interface EmitterArgs {
  /** in pixels */
  position: vec2;
}

export class Emitter extends Component {
  emitter: EmitterArgs;
  private _sprites: SpriteInstanceCollection;
  private active: Particle[] = [];
  private inactive: Particle[] = [];
  private particleCreationArgs: ParticleCreationArgs;
  private _running: boolean;
  private _spriteTexture: ISpriteTexture;

  /** emitter's position in pixels */
  position: vec2 = new vec2();

  /** the number of particles that are emitted */
  maxParticles: number = 20;

  get shader(): SpriteInstanceShader {
    return this.eng.particleManager.shader;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sprites = new SpriteInstanceCollection(this.eng);
    this.particleCreationArgs = {
      positionMin: new vec2(0, 0),
      positionMax: new vec2(0, 0),
      scaleMin: 0.7,
      scaleMax: 1.8,
      colorStart: new vec4(0.0, 0.0, 0.0, 1),
      colorEnd: new vec4(0, 0, 0, 0.1),
      gravity: new vec3(0, -0.2, 0),
      lifeTimeMin: 3000,
      lifeTimeMax: 2000,
      loc: [0, 0, 0, 0],
      velocityMin: new vec3(0.5, 0.6, 0),
      velocityMax: new vec3(0.4, 0.5, 0),
    };
  }

  initialize(options: EmitterArgs): void {
    this.emitter = options;

    // set the texture
    this._spriteTexture = this.eng.assetManager.getSprite('enemies.particle.1');
    this._sprites.setTexture(this._spriteTexture.texture);

    // clear out old particles
    this.active.forEach((p) => p.kill());
    this.inactive.forEach((p) => p.kill());
    this.active = [];
    this.inactive = [];
    this._sprites.clear();

    // add all particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.inactive.push(new Particle(this.eng, 'p_' + i, this._sprites));
    }

    this.position = options.position;

    this.start();
  }

  private createParticle(): void {
    // update args creation args
    this.particleCreationArgs.positionMin.x = this.position.x;
    this.particleCreationArgs.positionMin.y = this.position.y;
    this.particleCreationArgs.positionMax.x = this.position.x + 20;
    this.particleCreationArgs.positionMax.y = this.position.y + 5;
    this.particleCreationArgs.loc = this._spriteTexture.tile.loc;

    // get the next particle and initialize it
    const particle = this.inactive.pop();
    if (particle) {
      particle.initialize(this.particleCreationArgs);
      this.active.push(particle);
    }
  }

  start(): void {
    this._running = true;
  }

  update(dt: number): void {
    if (this._running) {
      // create a new particle
      this.createParticle();

      // update particles
      this.active.forEach((p) => {
        p.update(dt);
        if (!p.active) {
          this.inactive.push(p);
        }
      });

      // remove inactive particles from this list
      this.active = this.active.filter((a) => a.active);

      // update sprites
      this._sprites.update(dt);
    }
  }

  dispose(): void {}
}
