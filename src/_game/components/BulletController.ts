import { SpriteFlip } from '../../graphics/Sprite';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import vec3 from '../../math/vec3';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { MetersToPixels } from '../../systems/PhysicsManager';
import { PlatformEngine } from '../PlatformEngine';
import { BulletOptions } from '../system/BulletManager';
import { GameComponent } from './GameComponent';

export class BulletController extends GameComponent {
  private _active: boolean;
  private sprite: SpritBatchController;
  private _options: BulletOptions;
  private _ridgeBody: RidgeBody;

  constructor(eng: PlatformEngine, id: string) {
    super(eng);
    this._ridgeBody = new RidgeBody(eng, id, this);
    this._ridgeBody.onPositionChange = this.onPositionChange.bind(this);
    this._ridgeBody.onCollision = this.onCollision.bind(this);
    this._ridgeBody.active = false;
    this._ridgeBody.useGravity = false;

    this.eng.physicsManager.addBody(this._ridgeBody);
  }

  public get active(): boolean {
    return this._active;
  }

  public get position(): vec3 {
    return this._ridgeBody.position;
  }

  initialize(sprite: SpritBatchController, options: BulletOptions): void {
    this.sprite = sprite;
    this._options = options;
    this._options.position.copy(this._ridgeBody.position);
    this._options.velocity.copy(this._ridgeBody.instanceVelocity);

    this.sprite.activeSprite(options.id);
    this._ridgeBody.setId(options.id);

    this.sprite.setSprite('bullet.normal.1');
    this.sprite.scale(2.0);
    this.sprite.setSpritePosition(
      options.position.x,
      options.position.y,
      options.position.z
    );

    // set bounds in pixels
    this._ridgeBody.set(
      this._options.position.x * MetersToPixels,
      this.sprite.spriteWidth(),
      this._options.position.y * MetersToPixels,
      this.sprite.spriteHeight()
    );
    this._ridgeBody.active = true;
    this._active = true;
  }

  stop(): void {}

  private hitTest(x: number, y: number): boolean {
    if (x > this.eng.viewManager.right + this.sprite.spriteWidth()) {
      return true;
    } else if (x < this.eng.viewManager.left - this.sprite.spriteWidth()) {
      return true;
    }

    if (y > this.eng.viewManager.top + this.sprite.spriteHeight()) {
      return true;
    } else if (y < this.eng.viewManager.bottom) {
      return true;
    }
  }

  onPositionChange(newPosition: Readonly<vec3>): void {
    if (
      this.hitTest(
        newPosition.x * MetersToPixels,
        newPosition.y * MetersToPixels
      )
    ) {
      // destroy bullet
      this._active = false;
      this._ridgeBody.active = false;
      this.sprite.removeSprite(this._options.id);
      this.sprite.commitToBuffer();
    }
    this.sprite.activeSprite(this._options.id);
    this.sprite.setSpritePosition(
      newPosition.x * MetersToPixels,
      newPosition.y * MetersToPixels,
      newPosition.z * MetersToPixels
    );
    this.sprite.commitToBuffer();
  }

  onCollision(collisions: Collision2D[]): void {
    if (collisions.length > 0) {
      // destroy bullet
      this._active = false;
      this._ridgeBody.active = false;
      this.sprite.removeSprite(this._options.id);
      this.sprite.commitToBuffer();

      //TODO damage all collisions
    }
  }

  update(dt: number): void {
    // make sure the correct sprite is active
    this.sprite.activeSprite(this._options.id);
  }
}
