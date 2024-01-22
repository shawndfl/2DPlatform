import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { SpritBaseController } from '../../graphics/SpriteBaseController';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import rect from '../../math/rect';
import vec3 from '../../math/vec3';
import { Collision2D } from '../../physics/Collision2D';
import { RidgeBody } from '../../physics/RidgeBody';
import { PixelsToMeters } from '../../systems/PhysicsManager';
import { PlatformEngine } from '../PlatformEngine';
import { IEntity } from '../data/ILevelData2';
import { BulletController } from './BulletController';
import { Direction } from './Direction';
import { GameComponent } from './GameComponent';
import { HitAnimation } from './HitAnimation';

import { ShootAnimation } from './ShootAnimation';
import { TeleportAnimation } from './TeleportAnimation';

export class EnemyController2 extends GameComponent {
  private facingDirection: Direction;
  private movementDirection: Direction;
  private shootAnimation: ShootAnimation;
  private ridgeBody: RidgeBody;
  private teleportAnimation: TeleportAnimation;
  private hitAnimation: HitAnimation;
  private sprite: ISprite;
  private _entity: IEntity;
  private _id: string;

  public get id(): string {
    return this._id;
  }

  public get entity(): Readonly<IEntity> {
    return this._entity;
  }

  // config options
  private readonly bulletSpeed = 3.0;
  private readonly jumpVelocity = 3.0;

  constructor(
    eng: PlatformEngine,
    id: string,
    entity: IEntity,
    sprite: ISprite
  ) {
    super(eng);
    this.sprite = sprite;
    this._entity = entity;
    this._id = id;

    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);

    this.ridgeBody = new RidgeBody(this.eng, this.id, this);
    this.ridgeBody.showCollision = true;
  }

  initialize(): void {
    this.sprite.spriteImage('teleport.1'); //default

    this.sprite.flipDirection = SpriteFlip.XFlip; // face the left
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;

    // set the position of the tile and the ridge body
    this.sprite.left = this.entity.pos.x;
    this.sprite.top = this.entity.pos.y;

    // set the position in meters
    this.ridgeBody.position = new vec3([
      ...this.entity.pos.values,
      0,
    ] as any).scale(PixelsToMeters);

    const collisionHeight = 80;
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
    this.ridgeBody.onCollision = (other) => {
      console.debug('Enemy colliding with ', other);
    };
    // make this something you can collide with
    this.eng.physicsManager.setCollision(this.ridgeBody);

    //this.teleportAnimation.initialize(this.sprite);
    //this.shootAnimation.initialize(this.sprite);
    //this.hitAnimation.initialize(this.sprite);

    // initial enemy
    this.teleport(false);
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
