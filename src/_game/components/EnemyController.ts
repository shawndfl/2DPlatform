import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { PlatformEngine } from '../PlatformEngine';
import { CollisionType } from '../data/CollisionTypes';
import {
  EntityState,
  EntityStateFlags,
  EntityStateOptions,
} from '../data/EntityState';
import { BulletController } from './BulletController';
import { BulletType } from './BulletType';
import { DecisionAction, DecisionMaker } from './DecisionMaker';
import { Direction } from './Direction';
import { GameComponent } from './GameComponent';
import { HitAnimation } from './HitAnimation';

import { ShootAnimation } from './ShootAnimation';
import { TeleportAnimation } from './TeleportAnimation';

export interface EnemyControllerOptions {
  id: string;
  spriteName: string;
  health: number;
  pos: vec2;
}

export class EnemyController extends GameComponent {
  private facingDirection: Direction;
  private ridgeBody: RidgeBody;
  private sprite: ISprite;
  protected isActive: boolean;
  protected decision: DecisionMaker;
  private entityState: EntityState;
  private entityStateOptions: EntityStateOptions;

  public get id(): string {
    return this._options.id;
  }

  public get spriteName(): string {
    return this._options.spriteName;
  }

  public get entity(): Readonly<EnemyControllerOptions> {
    return this._options;
  }

  // config options
  private readonly bulletSpeed = 3.0;
  private readonly jumpVelocity = 3.0;

  constructor(eng: PlatformEngine, private _options: EnemyControllerOptions) {
    super(eng);

    if (!this._options.spriteName) {
      console.error('sprite required for entity ', this._options.id);
    }

    if (!this._options.id) {
      this._options.id = this.eng.random.getUuid();
    }

    this.decision = new DecisionMaker(this.eng);
    this.decision.onDecide = this.runAction.bind(this);

    // set up the sprite
    this.sprite = new SpriteInstanceController(
      this.id,
      this.eng.enemies.spriteCollection
    );
    this.sprite.spriteImage(this.spriteName);
    this.sprite.left = this._options.pos.x;
    this.sprite.top = this._options.pos.y;
    this.sprite.flipDirection = SpriteFlip.XFlip;
    this.sprite.xScale = 1;
    this.sprite.yScale = 1;

    // build the ridge body
    this.ridgeBody = new RidgeBody(
      this.eng,
      this.id,
      this,
      new rect([0, 64, 0, 64])
    );

    this.ridgeBody.collideMask =
      CollisionType.enemy |
      CollisionType.playerBullet |
      CollisionType.default |
      CollisionType.player;
    this.ridgeBody.collisionType = CollisionType.enemy;

    this.ridgeBody.showCollision = true;

    this.sprite.flipDirection = SpriteFlip.XFlip; // face the left
    this.sprite.xScale = 1.0;
    this.sprite.yScale = 1.0;
    this.sprite.topOffset = -1;
    this.sprite.leftOffset = 1;

    // set the position of the tile and the ridge body
    this.sprite.left = this.entity.pos.x;
    this.sprite.top = this.entity.pos.y;

    // set the position in pixels
    this.ridgeBody.setPos(this.entity.pos.x, this.entity.pos.y);

    const collisionHeight = 70;
    const collisionWidth = 64;

    // set the bounds for collision in pixels
    this.ridgeBody.setBounds(
      new rect([
        this.sprite.left,
        collisionWidth,
        this.sprite.top + collisionHeight,
        collisionHeight,
      ])
    );

    // update the sprite as the ridge body moves
    this.ridgeBody.onPosition = (left, top) => {
      // update the screen position.
      this.sprite.left = left; // + this.sprite.width * 0.5;
      this.sprite.top = top; // - this.sprite.height * 0.5;
    };

    this.ridgeBody.onCollision = (others: Collision2D[]) => {
      for (let c of others) {
        // is this a bullet
        if (c.tag instanceof BulletController) {
          const bullet = c.tag as BulletController;

          // only the player bullets can hit the enemy
          if (
            bullet.bulletType === BulletType.PlayerBullet ||
            bullet.bulletType === BulletType.PlayerBomb
          ) {
            this.hit(bullet);
          }
        }
      }
    };

    // make this something you can collide with
    this.eng.physicsManager.addBody(this.ridgeBody);

    // setup entity state
    this.entityState = new EntityState(this.eng);
    this.entityState.onStateChange = this.onStateChange;
    this.entityStateOptions = new EntityStateOptions();
    this.entityStateOptions.dieDelayMs = 1200;
    this.entityState.initialize(
      this.sprite,
      this.ridgeBody,
      this.entityStateOptions
    );

    // start by teleporting down
    this.entityState.teleport(false);

    // add this enemy
    this.eng.enemies.addEnemy(this);
  }

  /**
   * Handle state changes
   * @param before
   * @param after
   */
  onStateChange(before: EntityStateFlags, after: EntityStateFlags): void {}

  runAction(action: DecisionAction): void {
    if (this.entityState.state() == EntityStateFlags.Disable) {
      return;
    }
    switch (action) {
      case DecisionAction.Idle:
        this.entityState.idle();
        break;
      case DecisionAction.Jump:
        this.entityState.jump();
        break;
      case DecisionAction.Shoot:
        this.entityState.shoot(BulletType.EnemyBullet);
        break;
    }
  }

  hit(bullet: BulletController): void {
    this.entityState.hit();
    /*
    this.hitAnimation
      .start(this.facingDirection == Direction.Right)
      .onDone(() => {
        this.dispose();
      });
      */
  }

  dispose(): void {
    if (this.sprite) {
      this.sprite.visible = false;
    }
    this.eng.physicsManager.removeBody(this.ridgeBody);
    this.isActive = false;
  }

  update(dt: number) {
    this.decision.update(dt);
    this.entityState.update(dt);
  }
}
