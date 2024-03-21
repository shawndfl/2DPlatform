import { ISprite } from '../../graphics/ISprite';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import vec3 from '../../math/vec3';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { MetersToPixels } from '../../systems/PhysicsManager';
import { PlatformEngine } from '../PlatformEngine';
import { CollisionType } from '../data/CollisionTypes';
import { BulletOptions } from '../system/BulletManager';
import { BulletType } from './BulletType';
import { GameComponent } from './GameComponent';
import { PlayerController } from './PlayerController';

export class BulletController extends GameComponent {
  private _active: boolean;
  private sprite: ISprite;
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

    this._ridgeBody.onPosition = this.onPositionChange.bind(this);
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

  initialize(spriteCollection: SpriteInstanceCollection, options: BulletOptions): void {
    // lazy create sprite controllers
    if (!this.sprite) {
      this.sprite = new SpriteInstanceController(this._id, spriteCollection);
    }
    this._options = options;
    this._options.position.copy(this._ridgeBody.position);
    this._options.velocity.copy(this._ridgeBody.instanceVelocity);
    this._bulletType = this._options.bulletType;

    if (this._options.bulletType == BulletType.EnemyBullet) {
      this._ridgeBody.collisionType = CollisionType.enemyBullet;
      this._ridgeBody.collideMask = CollisionType.default | CollisionType.player;
    } else if (this._options.bulletType == BulletType.PlayerBullet) {
      this._ridgeBody.collisionType = CollisionType.playerBullet;
      this._ridgeBody.collideMask = CollisionType.default | CollisionType.enemy;
    }

    this._ridgeBody.setId(this._id);

    this.sprite.spriteImage('bullet.normal.1');
    this.sprite.topOffset = -0.5;
    this.sprite.leftOffset = 0.5;
    this.sprite.xScale = 1.0;
    this.sprite.yScale = 1.0;
    this.sprite.left = options.position.x;
    this.sprite.top = options.position.y;
    this.sprite.depth = options.position.z;

    // set bounds in pixels
    this._ridgeBody.set(this._options.position.x, this.sprite.width, this._options.position.y, this.sprite.height);
    this._ridgeBody.active = true;
    this._active = true;
    this.sprite.visible = true;
  }

  destroy(): void {
    this._active = false;
    this._ridgeBody.active = false;
    this.sprite.visible = false;
  }

  onPositionChange(left: number, top: number, body: RidgeBody): void {
    if (!this.sprite) {
      return;
    }
    this.sprite.left = left;
    this.sprite.top = top;

    if (this.sprite.left < this.eng.viewManager.left - 100) {
      this.destroy();
    }

    if (this.sprite.left > this.eng.viewManager.right + 100) {
      this.destroy();
    }
  }

  onCollision(collisions: Collision2D[]): void {
    if (!this.sprite || !collisions || collisions.length == 0) {
      return;
    }

    if (!collisions) {
      return;
    }

    // destroy bullet
    this.destroy();

    // if we hit an enemy
    //if (c.tag instanceof EnemyController) {
    //  const enemy = c.tag as EnemyController;
    //  enemy.hit(this);
    //  console.debug('hitting ', c);
    //}

    // hit a player
    for (let c of collisions) {
      if (this._bulletType == BulletType.EnemyBullet) {
        if (c.tag instanceof PlayerController) {
          //TODO
        }
      }
    }
  }

  update(dt: number): void {}
}
