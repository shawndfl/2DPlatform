import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { SpriteInstanceShader } from '../shaders/SpriteInstanceShader';
import { ITextureAsset } from '../systems/AssetManager';
import { Particle, ParticleCreationArgs } from './Particle';

export interface EmitterArgs extends ParticleCreationArgs {
  /** in pixels */
  position: vec2;
  maxParticles: number;
  /** the name of the sprite to use */
  sprite: string;
  /** the texture asset to use */
  textureAsset: ITextureAsset;
  /** wait for all particles to die before they are created again */
  waitForAll: boolean;
}

export class Emitter extends Component {
  emitter: EmitterArgs;
  private _sprites: SpriteInstanceCollection;
  private active: Particle[] = [];
  private inactive: Particle[] = [];
  private _running: boolean;
  private _creationDelay: number;
  private _creationTimer: number;
  private _id: string;
  protected _textureAsset: ITextureAsset;

  /** emitter's position in pixels */
  position: vec2 = new vec2();

  /** the number of particles that are emitted */
  maxParticles: number = 20;

  get id(): string {
    return this._id;
  }

  get shader(): SpriteInstanceShader {
    return this.eng.particleManager.shader;
  }

  constructor(eng: Engine, id: string) {
    super(eng);
    this._id = id;
    this._sprites = new SpriteInstanceCollection(this.eng);
  }

  initialize(options: EmitterArgs): void {
    this.emitter = options;
    this._creationDelay = options.creationDelay;
    this._creationTimer = 0;
    this.position = options.position;
    this.maxParticles = options.maxParticles;

    // set the texture
    this._sprites.initialize(
      options.textureAsset.texture,
      options.textureAsset.data
    );

    // clear out old particles
    this.active.forEach((p) => p.kill());
    this.inactive.forEach((p) => p.kill());
    this.active = [];
    this.inactive = [];
    this._sprites.clear();

    // add all particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.inactive.push(
        new Particle(this.eng, this._id + '_p_' + i, this._sprites)
      );
    }

    this.start();
  }

  private createParticle(): void {
    // update args creation args
    this.emitter.positionMin.x = this.position.x;
    this.emitter.positionMin.y = this.position.y;
    this.emitter.positionMax.x = this.position.x + 10;
    this.emitter.positionMax.y = this.position.y + 10;
    this.emitter.loc = this._sprites.getLoc('particle.1');

    // spit them all out at once if there is no delay
    if (this.emitter.creationDelay == 0) {
      // do we need to wait for all
      if (
        (this.emitter.waitForAll && this.active.length == 0) ||
        !this.emitter.waitForAll
      ) {
        this.inactive.forEach((p) => {
          p.initialize(this.emitter);
          this.active.push(p);
        });
        this.inactive = [];
      }
    }
    // delay creation
    else if (this._creationTimer >= this._creationDelay) {
      // do we need to wait for all
      if (
        (this.emitter.waitForAll && this.active.length == 0) ||
        !this.emitter.waitForAll
      ) {
        // get the next particle and initialize it
        const particle = this.inactive.pop();
        if (particle) {
          particle.initialize(this.emitter);
          this.active.push(particle);
        }
      }
      this._creationTimer = 0;
    }
  }

  start(): void {
    this._running = true;
  }

  update(dt: number): void {
    if (this._running) {
      const view = this.eng.viewManager;
      let projection = view.projection;

      this.shader.setSpriteSheet(this._sprites.spriteTexture);
      this.shader.enable();

      // set the project
      this.shader.setProj(projection);

      this._creationTimer += dt;
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
