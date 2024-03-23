import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import { equals } from '../../math/constants';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { PlatformEngine } from '../PlatformEngine';
import { CollisionType } from '../data/CollisionTypes';
import { EntityStateController, EntityStateFlags, EntityStateOptions } from '../data/EntityStateController';
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
  private entityState: EntityStateController;
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
    this.decision.onValidate = this.decisionValidate.bind(this);

    // set up the sprite
    this.sprite = new SpriteInstanceController(this.id, this.eng.enemies.spriteCollection);
    this.sprite.spriteImage(this.spriteName);
    this.sprite.left = this._options.pos.x;
    this.sprite.top = this._options.pos.y;
    this.sprite.flipDirection = SpriteFlip.XFlip;
    this.sprite.xScale = 1;
    this.sprite.yScale = 1;

    // build the ridge body
    this.ridgeBody = new RidgeBody(this.eng, this.id, this, new rect([0, 64, 0, 64]));

    this.ridgeBody.collideMask =
      CollisionType.enemy | CollisionType.playerBullet | CollisionType.default | CollisionType.player;
    this.ridgeBody.collisionType = CollisionType.enemy;

    //this.ridgeBody.showCollision = true;

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
      new rect([this.sprite.left, collisionWidth, this.sprite.top + collisionHeight, collisionHeight])
    );

    // update the sprite as the ridge body moves
    this.ridgeBody.onPosition = (left, top) => {
      // update the screen position.
      this.sprite.left = left; // + this.sprite.width * 0.5;
      this.sprite.top = top; // - this.sprite.height * 0.5;
    };

    this.ridgeBody.onCollision = this.onCollision.bind(this);

    // make this something you can collide with
    this.eng.physicsManager.addBody(this.ridgeBody);

    // setup entity state
    this.entityState = new EntityStateController(this.eng);
    this.entityStateOptions = new EntityStateOptions();
    this.entityStateOptions.dieDelayMs = 100;
    this.entityStateOptions.type = 'enemy';
    this.entityState.initialize(this.sprite, this.ridgeBody, this.entityStateOptions);

    // start by teleporting down
    this.entityState.teleport(false);

    // add this enemy
    this.eng.enemies.addEnemy(this);
  }

  onCollision(others: Collision2D[]): void {
    let touchingGround = false;
    let collidingRight = false;
    let collidingLeft = false;

    for (let c of others) {
      // is this a bullet
      if (c.tag instanceof BulletController) {
        const bullet = c.tag as BulletController;

        // only the player bullets can hit the enemy
        if (bullet.bulletType === BulletType.PlayerBullet || bullet.bulletType === BulletType.PlayerBomb) {
          this.hit(bullet);
        }
      }

      if (c.tag instanceof EnemyController) {
      }
      if (equals(c.top, this.ridgeBody.bottom)) {
        touchingGround = true;
      }

      if (c.right == this.ridgeBody.left) {
        collidingLeft = true;
      }
      if (c.left == this.ridgeBody.right) {
        collidingRight = true;
      }
    }

    if (!touchingGround && (collidingLeft || collidingRight)) {
      this.entityState.slidingDown(collidingRight);
    } else if (touchingGround) {
      this.entityState.landed();
    }
  }

  decisionValidate(lastAction: DecisionAction, newAction: DecisionAction): DecisionAction {
    if (lastAction == DecisionAction.MoveRight) {
    }
    return newAction;
  }

  runAction(action: DecisionAction): void {
    if (this.entityState.stateType == EntityStateFlags.Disable || this.isActive == false) {
      return;
    }
    switch (action) {
      case DecisionAction.Idle:
        this.entityState.stopMoving();
        this.entityState.stopJumping();
        this.entityState.idle();
        break;
      case DecisionAction.Jump:
        this.entityState.jump();
        break;
      case DecisionAction.Shoot:
        this.entityState.shoot(BulletType.EnemyBullet);
        break;
      case DecisionAction.MoveLeft:
        this.entityState.move(false);
        break;
      case DecisionAction.MoveRight:
        this.entityState.move(true);
        break;
    }
  }

  hit(bullet: BulletController): void {
    this.isActive = false;

    this.entityState.hit(() => {
      this.dispose();
    });
  }

  hitByDeath(other: Collision2D): void {
    this.entityState.die(() => {
      this.dispose();
    });
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
