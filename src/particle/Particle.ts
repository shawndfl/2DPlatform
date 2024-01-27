import { PlatformEngine } from '../_game/PlatformEngine';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../graphics/SpriteInstanceController';
import { toRadian } from '../math/constants';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { RidgeBody } from '../physics/RidgeBody';
import { MetersToPixels, PixelsToMeters } from '../systems/PhysicsManager';

export interface ParticleCreationArgs {
  positionMin: vec2;
  positionMax: vec2;
  angleMin: number;
  angleMax: number;

  speedMin: number;
  speedMax: number;

  /** delay in ms between particle creation */
  creationDelay: number;

  scaleMin: number;
  scaleMax: number;

  /** add to scale over the life time of the particle */
  scaleGrowth: number;
  /** width over height for the scale value */
  scaleAspectRatio: number;

  /** in degrees */
  rotation: number;
  /** degrees per second */
  angularVelocity: number;

  colorStart: vec4;
  colorEnd: vec4;

  gravity: vec3;

  /** life time in ms */
  lifeTimeMin: number;
  lifeTimeMax: number;
  loc: [number, number, number, number];
}

export class Particle extends Component {
  private ridgeBody: RidgeBody;
  private spriteController: SpriteInstanceController;
  private _active: boolean;
  private _lifeTime: number;
  private _maxLifeTime: number;
  private _colorStart: vec4;
  private _colorEnd: vec4;
  private _initialScale: number;
  private _scaleGrowth: number;
  private _scaleAspectRatio: number;
  private _speedMin: number;
  private _speedMax: number;
  private _angleMin: number;
  private _angleMax: number;

  /** in degrees */
  private rotation: number;
  /** degrees per second */
  private angularVelocity: number;

  get active(): boolean {
    return this._active;
  }

  constructor(
    eng: Engine,
    id: string,
    spriteCollection: SpriteInstanceCollection
  ) {
    super(eng);
    this.spriteController = new SpriteInstanceController(id, spriteCollection);
    this.spriteController.spriteImage('particle.1');
    this.ridgeBody = new RidgeBody(eng, id, this.spriteController);
    this._colorStart = new vec4();
    this._colorEnd = new vec4();
  }

  private getValue(min: number, max: number): number {
    const scale = max - min;
    return this.eng.random.rand() * scale + min;
  }

  private getValueVec2(min: vec2, max: vec2): vec2 {
    const scaleX = max.x - min.x;
    const scaleY = max.y - min.y;
    const x = this.eng.random.rand() * scaleX + min.x;
    const y = this.eng.random.rand() * scaleY + min.y;
    return new vec2(x, y);
  }

  private getValueVec3(min: vec3, max: vec3): vec3 {
    const scaleX = max.x - min.x;
    const scaleY = max.y - min.y;
    const scaleZ = max.z - min.z;
    const x = this.eng.random.rand() * scaleX + min.x;
    const y = this.eng.random.rand() * scaleY + min.y;
    const z = this.eng.random.rand() * scaleZ + min.y;
    return new vec3(x, y, z);
  }

  updateColor(): void {
    const t = 1 - (this._maxLifeTime - this._lifeTime) / this._maxLifeTime;
    this._colorStart.leap(t, this._colorEnd, this.spriteController.colorScale);
  }

  updateScale(): void {
    const t = 1 - (this._maxLifeTime - this._lifeTime) / this._maxLifeTime;
    const scale = this._initialScale * t + (1 - t) * this._scaleGrowth;

    this.spriteController.xScale = scale;
    this.spriteController.yScale = scale / this._scaleAspectRatio;

    this._colorStart.leap(t, this._colorEnd);
  }

  initialize(opts: ParticleCreationArgs) {
    const startPosition = this.getValueVec2(opts.positionMin, opts.positionMax);
    this._maxLifeTime = this.getValue(opts.lifeTimeMin, opts.lifeTimeMax);
    this._lifeTime = this._maxLifeTime;
    this._initialScale = this.getValue(opts.scaleMin, opts.scaleMax);

    this._scaleGrowth = opts.scaleGrowth;
    this._scaleAspectRatio = opts.scaleAspectRatio;
    this.rotation = opts.rotation;
    this._angleMin = opts.angleMin;
    this._angleMax = opts.angleMax;
    this._speedMin = opts.speedMin;
    this._speedMax = opts.speedMax;
    this.angularVelocity = opts.angularVelocity;

    opts.colorStart.copy(this._colorStart);
    opts.colorEnd.copy(this._colorEnd);

    this.spriteController.spriteLocation(opts.loc);
    this.spriteController.angle = 0;
    opts.colorStart.copy(this.spriteController.colorScale);
    this.spriteController.topOffset = 0.5;
    this.spriteController.leftOffset = 0.5;
    this.spriteController.depth = -0.8;
    this.spriteController.xScale = this._initialScale;
    this.spriteController.yScale = this._initialScale / this._scaleAspectRatio;

    this.spriteController.left = startPosition.x;
    this.spriteController.top = startPosition.y;

    this.ridgeBody.set(
      this.spriteController.left,
      this.spriteController.width,
      this.spriteController.top + this.spriteController.height,
      this.spriteController.height
    );

    // initialize ridge body
    const a = toRadian(this.getValue(this._angleMin, this._angleMax));
    const l = this.getValue(this._speedMin, this._speedMax);

    this.ridgeBody.instanceVelocity = new vec3(
      Math.cos(a) * l,
      Math.sin(a) * l,
      0
    );
    this.ridgeBody.customGravity = opts.gravity.copy(
      this.ridgeBody.customGravity
    );
    this.ridgeBody.acceleration.reset();
    this.ridgeBody.velocity.reset();

    this.ridgeBody.setPos(
      this.spriteController.left,
      this.spriteController.top
    );

    // update the position of the particle
    this.ridgeBody.onPosition = (left, top, body) => {
      this.spriteController.left = left;
      this.spriteController.top = top;
    };

    // on collision kill it.
    this.ridgeBody.onCollision = (other) => {
      // if the particle hits anything kill it
      this.kill();
    };

    // debug
    this.ridgeBody.showCollision = false;

    // add the ridgeBody and activate the particle
    this._active = true;
    this.spriteController.visible = true;
    this.eng.physicsManager.addBody(this.ridgeBody);
  }

  kill(): void {
    this.spriteController.visible = false;
    // remove this from the list of active
    this.eng.physicsManager.removeBody(this.ridgeBody);
    this._active = false;
  }

  update(dt: number): void {
    if (this.active) {
      this._lifeTime -= dt;
      this.updateColor();
      this.updateScale();

      if (this._lifeTime <= 0) {
        this.kill();
      }
    }
  }
}
