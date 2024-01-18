import { SpritBatchController } from '../../graphics/SpriteBatchController';
import vec3 from '../../math/vec3';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { MetersToPixels } from '../../systems/PhysicsManager';
import { PlatformEngine } from '../PlatformEngine';
import { BulletOptions } from '../system/BulletManager';
import { BulletType } from './BulletType';
import { GameComponent } from './GameComponent';
import { PlayerController } from './PlayerController';

export class BulletController extends GameComponent {
  private _active: boolean;
  private sprite: SpritBatchController;
  private _options: BulletOptions;
  private _ridgeBody: RidgeBody;
  private _bulletType: BulletType;
  private _id: string;

  public get id(): string {
    return this._id;
  }
  public get bulletType(): BulletType {
    return this._bulletType;
  }

  constructor(eng: PlatformEngine, id: string) {
    super(eng);
    this._id = id;
    this._ridgeBody = new RidgeBody(eng, id, this);
    this._ridgeBody.onPositionChange = this.onPositionChange.bind(this);
    this._ridgeBody.onCollision = this.onCollision.bind(this);
    this._ridgeBody.active = false;

    // no gravity
    this._ridgeBody.customGravity = vec3.zero.copy();

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
    this._bulletType = this._options.bulletType;

    this.sprite.activeSprite(this._id);
    this._ridgeBody.setId(this._id);

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
      this.sprite.removeSprite(this._id);
      this.sprite.commitToBuffer();
    }
    this.sprite.activeSprite(this._id);
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
      this.sprite.removeSprite(this.id);
      this.sprite.commitToBuffer();

      // check collisions
      collisions.forEach((c) => {
        // if we hit an enemy
        //if (c.tag instanceof EnemyController) {
        //  const enemy = c.tag as EnemyController;
        //  enemy.hit(this);
        //  console.debug('hitting ', c);
        //}

        // hit a player
        if (c.tag instanceof PlayerController) {
          //TODO
        }
      });
    }
  }

  update(dt: number): void {
    // make sure the correct sprite is active
    this.sprite.activeSprite(this.id);
  }
}
