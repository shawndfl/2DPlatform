import { UserAction } from '../../core/UserAction';
import { TextureAssets } from '../system/GameAssetManager';
import { TeleportAnimation } from './TeleportAnimation';
import { WalkAnimation } from './WalkAnimation';
import { PlatformEngine } from '../PlatformEngine';

import vec3 from '../../math/vec3';
import { SpriteId } from '../data/SpriteId';
import { ShootAnimation } from './ShootAnimation';
import rect from '../../math/rect';
import { JumpAnimation } from './JumpAnimation';
import { InputState } from '../../core/InputState';
import { RidgeBody } from '../../physics/RidgeBody';
import { PixelsToMeters } from '../../systems/PhysicsManager';
import { Direction } from './Direction';
import { BulletType } from './BulletType';
import { Collision2D } from '../../physics/Collision2D';
import { GameComponent } from './GameComponent';
import { SpriteController2 } from '../../graphics/SpriteController2';
import vec2 from '../../math/vec2';
import { IPlayerOptions } from '../data/ILevelData2';
import { HitAnimation } from './HitAnimation';
import { Curve } from '../../math/Curve';
import { EntityState, EntityStateFlags } from '../data/EntityState';

export class PlayerController extends GameComponent {
  private sprite: SpriteController2;
  private facingDirection: Direction;
  private movementDirection: Direction;
  private teleportAnimation: TeleportAnimation;
  private walk: WalkAnimation;
  private shootAnimation: ShootAnimation;
  private jumpAnimation: JumpAnimation;
  private hitAnimation: HitAnimation;
  private _state: EntityState;

  /** a new jump can start after the jump button is released */
  private jumpReset: boolean;
  /** Must be on a floor to start a jump */
  private touchingFloor: boolean;

  /** How many mid air jumps can we do */
  private midAirJump: number;
  private readonly maxMidAirJumps = 1;

  private ridgeBody: RidgeBody;

  // config options
  private readonly bulletSpeed = 4.0;
  private readonly jumpVelocity = 3.0;

  get id(): string {
    return SpriteId.Player;
  }

  get facingRight(): boolean {
    return this.facingDirection == Direction.Right;
  }

  get facingLeft(): boolean {
    return this.facingDirection == Direction.Left;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.sprite = new SpriteController2(eng);

    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.walk = new WalkAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);

    this.facingDirection = Direction.Right;
    this.movementDirection = Direction.Right;

    this.jumpAnimation = new JumpAnimation(eng);
    this.touchingFloor = false;
    this.midAirJump = 0;
    this._state = new EntityState(EntityStateFlags.None);

    this.ridgeBody = new RidgeBody(
      this.eng,
      'player',
      this,
      new rect([0, 64, 0, 64])
    );
    this.ridgeBody.onPosition = this.updateFromRidgeBodyPosition.bind(this);
    this.ridgeBody.onCollision = this.onCollision.bind(this);
    this.eng.physicsManager.addBody(this.ridgeBody);
  }

  reset(): void {
    // reset state
    this.facingDirection = Direction.Right;
    this.movementDirection = Direction.Right;
    this._state.set(EntityStateFlags.None);
    this.touchingFloor = false;
    this.midAirJump = 0;

    // offset the sprite from the center to the top left
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;

    // set the default image and double the scale
    this.sprite.spriteImage('default');
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;

    this.sprite.depth = 0.7;

    // initial the player's position
    // and collision box size
    this.ridgeBody.set(
      0,
      this.sprite.width,
      0 + this.sprite.height,
      this.sprite.height
    );

    // add the ridge body back in
    this.eng.physicsManager.addBody(this.ridgeBody);

    // initialize animations
    this.teleportAnimation.initialize(this.sprite);
    this.walk.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite);
  }

  initialize(): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.edge);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    // offset the sprite from the center to the top left
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;

    // set the default image and double the scale
    this.sprite.spriteImage('default');
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;
    this.sprite.depth = 0.7;

    // initial the player's position
    // and collision box size
    this.ridgeBody.set(
      100,
      this.sprite.width,
      150 + this.sprite.height,
      this.sprite.height
    );
    this.ridgeBody.active = true;

    this.teleportAnimation.initialize(this.sprite);
    this.walk.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite);

    // setup the teleport animation
    this.teleport(false);
  }

  loadPlayer(options: IPlayerOptions): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.edge);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    // offset the sprite from the center to the top left
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;

    // set the default image and double the scale
    this.sprite.spriteImage('default');
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;
    this.sprite.depth = 0.7;

    this.setPosition(options.position.x, options.position.y);
    this.ridgeBody.showCollision = options.meta.get('debug') == 'true';
    this.ridgeBody.active = true;
    // setup the teleport animation
    this.teleport(false);
  }

  handleUserAction(state: InputState): boolean {
    if (state.isReleased(UserAction.Up)) {
      this.teleport(true);
    }
    if (state.isReleased(UserAction.Down)) {
      this.teleport(false);
    }

    if (!this.ridgeBody.active) {
      return false;
    }

    if (state.isDown(UserAction.Right)) {
      if (this.touchingFloor) {
        this.walk.start(true);
      }

      this.facingDirection = Direction.Right;
      this.movementDirection = Direction.Right;
      this._state.append(EntityStateFlags.Running);
    }
    if (state.isDown(UserAction.Left)) {
      if (this.touchingFloor) {
        this.walk.start(false);
      }
      this.facingDirection = Direction.Left;
      this.movementDirection = Direction.Left;
      this._state.append(EntityStateFlags.Running);
    }
    if (state.isReleased(UserAction.Right)) {
      this.walk.stop();
      this._state.remove(EntityStateFlags.Running);
    }
    if (state.isReleased(UserAction.Left)) {
      this.walk.stop();
      this._state.remove(EntityStateFlags.Running);
    }

    if (state.isReleased(UserAction.A)) {
      this.shoot();
    }
    if (state.isDown(UserAction.B)) {
      if (!this.jumpReset) {
        this.jumpReset = true;
        this.jump();
      }
    }
    if (state.isReleased(UserAction.B)) {
      this.ridgeBody.velocity.y = 0;
      this.jumpReset = false;
    }
    return false;
  }

  private teleport(up: boolean): void {
    this.ridgeBody.active = false;

    // remove teleporting flag and set it correctly
    this._state.remove(EntityStateFlags.Teleporting);
    this._state.set(
      up ? EntityStateFlags.TeleportUp : EntityStateFlags.TeleportDown
    );

    // update teleport position
    this.teleportAnimation.groundLevel = this.ridgeBody.bottom;
    this.teleportAnimation.xOffset = this.ridgeBody.left;
    this.teleportAnimation.start(up).onDone(() => {
      if (!this.teleportAnimation.isUp) {
        this.ridgeBody.active = true;
        // we are not teleporting anymore
        this._state.remove(EntityStateFlags.Teleporting);
      }
    });
  }

  private onCollision(others: Collision2D[]): void {
    this.midAirJump = this.maxMidAirJumps;
    this.touchingFloor = false;
    for (let c of others) {
      if (this.ridgeBody.bottom == c.top) {
        this.touchingFloor = true;
      }
    }
  }

  private jump(): void {
    if (this.touchingFloor || this.midAirJump > 0) {
      // use your mid air jumps if we are not touching the floor
      if (!this.touchingFloor) {
        this.midAirJump--;
      }
      this.ridgeBody.velocity.y = this.jumpVelocity;
      this.jumpAnimation.start(false);
    }
  }

  private shoot(): void {
    const facingRight = this.facingRight;
    if (this._state.isTrue(EntityStateFlags.Running)) {
      //NOP
    } else if (this._state.isTrue(EntityStateFlags.Falling)) {
      //NOP
    } else if (this._state.isTrue(EntityStateFlags.SlidingDownWall)) {
      //NOP
    } else {
      this.shootAnimation.start(facingRight);
    }

    // get the start position of the bullet
    const startPos = new vec3(this.ridgeBody.left, this.ridgeBody.bottom, 0);
    startPos.y += 45;
    startPos.x += facingRight ? 35 : -5;

    const speed = this.bulletSpeed; // m/second
    const velocity = new vec3(facingRight ? speed : -speed, 0, 0);
    this.eng.bullets.addBullet({
      bulletType: BulletType.PlayerBullet,
      position: startPos,
      velocity,
    });
  }

  run(dt: number): void {
    this.walk.touchingFloor = this.touchingFloor;
    if (this._state.isTrue(EntityStateFlags.Teleporting)) {
      return;
    } else if (this._state.isTrue(EntityStateFlags.Hit)) {
      return;
    } else if (this._state.isTrue(EntityStateFlags.Dead)) {
      return;
    } else if (this._state.isTrue(EntityStateFlags.SlidingDownWall)) {
      return;
    } else if (this._state.isTrue(EntityStateFlags.Running)) {
      if (this.facingRight) {
        this.ridgeBody.instanceVelocity.x = PixelsToMeters * 500;
      } else {
        this.ridgeBody.instanceVelocity.x = -PixelsToMeters * 500;
      }
    } else {
      this.sprite.spriteImage('default');
      this.ridgeBody.instanceVelocity.x = 0;
    }

    if (!this.touchingFloor) {
      this.sprite.spriteImage('jump.5');
    }
  }

  /**
   * Used to manually set the player's position.
   * This should only be done during setup and from then on the
   * ridgeBody will manage the position.
   * @param left
   * @param top
   */
  setPosition(left: number, top: number): void {
    this.ridgeBody.set(
      left,
      this.sprite.width,
      top + this.sprite.height,
      this.sprite.height
    );
    this.updateFromRidgeBodyPosition(left, top, this.ridgeBody);
  }

  /**
   * This is used to set the position of the player.
   * This will check for collisions and adjust the position
   * @param position
   */
  private updateFromRidgeBodyPosition(
    left: number,
    top: number,
    body: Collision2D
  ): void {
    // update the screen position.
    this.sprite.left = left; // + this.sprite.width * 0.5;
    this.sprite.top = top; // - this.sprite.height * 0.5;

    // update view manager position
    const forwardPadding = 200;
    const upPadding = 100;
    const xOffset = this.sprite.left - this.eng.width / 2 + forwardPadding;
    const yOffset = this.sprite.top - this.eng.height / 2 + upPadding;
    this.eng.viewManager.setTarget(xOffset, yOffset);
    //console.debug('player: pos ' + this.screenPosition);
  }

  /**
   * When we are hit by a bullet
   * @param by
   */
  hit(by: Collision2D): void {
    this.ridgeBody.active = false;
    this._state.set(EntityStateFlags.Dead);

    if (!this.hitAnimation.isRunning) {
      this.ridgeBody.active = false;
      this.hitAnimation.start(this.facingDirection == Direction.Right);
      this.hitAnimation.onDone = (curve: Curve) => {
        this.eng.sceneManager.setNextScene('level.2.0');
        console.debug('die');
      };
    }
  }

  update(dt: number): void {
    this.run(dt);

    // can't do anything when you are hit
    if (!this._state.isTrue(EntityStateFlags.Dead)) {
      this.jumpAnimation.update(dt);
      this.teleportAnimation.update(dt);
      this.walk.update(dt);
      this.shootAnimation.update(dt);
    }
    this.hitAnimation.update(dt);

    this.sprite.update(dt);
  }
}
