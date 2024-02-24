import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { SpritBaseController } from '../../graphics/SpriteBaseController';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { PixelsToMeters } from '../../systems/PhysicsManager';
import { PlatformEngine } from '../PlatformEngine';
import { ICollision, IEntity } from '../data/ILevelData';
import { BulletController } from './BulletController';
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
  private movementDirection: Direction;
  private shootAnimation: ShootAnimation;
  private ridgeBody: RidgeBody;
  private teleportAnimation: TeleportAnimation;
  private hitAnimation: HitAnimation;
  private sprite: ISprite;

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

    // create the animations
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);

    this.ridgeBody = new RidgeBody(
      this.eng,
      this.id,
      this,
      new rect([0, 64, 0, 64])
    );

    this.ridgeBody.showCollision = true;

    this.sprite.spriteImage('teleport.1'); //default

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

    const collisionHeight = 64;
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

    this.ridgeBody.onPosition = (left, top) => {
      // update the screen position.
      this.sprite.left = left; // + this.sprite.width * 0.5;
      this.sprite.top = top; // - this.sprite.height * 0.5;
    };

    this.ridgeBody.onCollision = (other) => {
      console.debug('Enemy colliding with ', other);
    };

    // make this something you can collide with
    this.eng.physicsManager.addBody(this.ridgeBody);

    this.teleportAnimation.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite);

    // initial enemy
    this.teleport(false);

    // add this enemy
    this.eng.enemies.addEnemy(this);
  }

  run(dt: number): void {
    if (!this.teleportAnimation.running && !this.teleportAnimation.isUp) {
    }
  }

  private teleport(up: boolean): void {
    this.ridgeBody.active = false;

    // update teleport position
    this.teleportAnimation.groundLevel = this.sprite.top;
    this.teleportAnimation.xOffset = this.sprite.left;
    this.teleportAnimation.start(up).onDone(() => {
      if (!this.teleportAnimation.isUp) {
        this.ridgeBody.active = true;
      }
    });
  }

  hit(bullet: BulletController): void {
    console.debug('hit ' + bullet.bulletType);
    this.hitAnimation.start(this.facingDirection == Direction.Right);
  }

  update(dt: number) {
    this.run(dt);

    this.teleportAnimation.update(dt);
    this.shootAnimation.update(dt);
    this.hitAnimation.update(dt);
  }
}
