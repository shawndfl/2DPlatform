import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import vec3 from '../../math/vec3';
import { RidgeBody } from '../../physics/RidgeBody';
import { PlatformEngine } from '../PlatformEngine';
import { BulletType } from '../components/BulletType';
import { Direction } from '../components/Direction';
import { GameComponent } from '../components/GameComponent';
import { HitAnimation } from '../components/HitAnimation';
import { JumpAnimation } from '../components/JumpAnimation';
import { RecoveryAnimation } from '../components/RecoveryAnimation';
import { RunAnimation } from '../components/RunAnimation';
import { ShootAnimation } from '../components/ShootAnimation';
import { TeleportAnimation } from '../components/TeleportAnimation';
import { EntityStateController, EntityStateFlags, EntityStateOptions } from './EntityStateController';

export class EntityStateActions extends GameComponent {
  private controller: EntityStateController;
  private teleportAnimation: TeleportAnimation;
  private runAnimation: RunAnimation;
  private shootAnimation: ShootAnimation;
  private jumpAnimation: JumpAnimation;
  private hitAnimation: HitAnimation;
  private recoveryAnimation: RecoveryAnimation;

  /**
   * Sprite that we will be animating
   */
  private sprite: ISprite;
  private ridgeBody: RidgeBody;
  private options: EntityStateOptions;

  /**
   * What direction is the entity facing
   */
  private _facingDirection: Direction;

  /** Must be on a floor to start a jump */
  private shooting: boolean;

  /** How many mid air jumps can we do */
  private midAirJump: number;

  public get facingDirection(): Direction {
    return this._facingDirection;
  }

  public get facingRight(): boolean {
    return this._facingDirection == Direction.Right;
  }

  constructor(eng: PlatformEngine, controller: EntityStateController) {
    super(eng);

    this.controller = controller;
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.runAnimation = new RunAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);
    this.recoveryAnimation = new RecoveryAnimation(this.eng);

    this._facingDirection = Direction.Right;
    this.midAirJump = 0;
    this.shooting = false;
  }

  initialize(sprite: ISprite, ridgeBody: RidgeBody, options: EntityStateOptions): void {
    this.sprite = sprite;
    this.ridgeBody = ridgeBody;
    this.options = options;

    this.ridgeBody.maxVelocity = new vec3(options.runMaxSpeed, 1000, 1000);
    this.ridgeBody.minVelocity = new vec3(-options.runMaxSpeed, -1000, -1000);
    this._facingDirection = options.facingDirection;
    this.midAirJump = options.midAirJumps;
    this.shooting = false;

    // initialize animations
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.runAnimation = new RunAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);
    this.recoveryAnimation = new RecoveryAnimation(this.eng);

    this.teleportAnimation.initialize(this.sprite);
    this.runAnimation.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite, this.options.dieDelayMs);
    this.recoveryAnimation.initialize(this.sprite);
  }

  /**
   * Height can be 46 or
   * @param height
   */
  adjustCollisionHeight(height: number): void {}

  /**
   * After hit prevent a second hit for a while
   */
  recovery(animationComplete: () => void): void {
    this.recoveryAnimation.start().onDone(animationComplete);
  }

  resetPhysics(resetVelocity: boolean = false): void {
    this.ridgeBody.active = true;
    if (resetVelocity) {
      this.ridgeBody.velocity.reset();
    }
    this.ridgeBody.instanceVelocity.reset();
    this.ridgeBody.acceleration.reset();
  }

  resetAnimations(): void {
    // stop all animations
    this.jumpAnimation.stop();
    this.runAnimation.stop();
    this.hitAnimation.stop();
    this.teleportAnimation.stop();
    this.shootAnimation.stop();
  }

  reset(): void {
    this.resetAnimations();
    this.resetPhysics(true);

    // reset other flags
    this.shooting = false;
    this.midAirJump = this.options.midAirJumps;
  }

  idle(): void {
    // set sprite
    this.sprite.spriteImage('default');
    this.reset();
  }

  /**
   * Run the landing animation
   */
  landed(): void {
    // set sprite
    this.sprite.spriteImage('default');
    this.resetAnimations();

    this.resetPhysics(false);

    // reset other flags
    this.shooting = false;
    this.midAirJump = this.options.midAirJumps;
  }

  stopJumping(): void {
    this.resetAnimations();
    // set sprite
    this.sprite.spriteImage('jump.5');

    // reset physics
    this.ridgeBody.velocity.y = 0;
  }

  /**
   * The player stops moving by releasing the arrow keys or stops jumping
   * @returns
   */
  stopMoving(): void {
    this.reset();
  }

  /**
   * Sets the default image
   */
  setDefault(): void {
    this.sprite.spriteImage('default');
  }

  slidingDown(right: boolean): void {
    //TODO
  }

  faceDirection(right: boolean): void {
    this._facingDirection = right ? Direction.Right : Direction.Left;
  }

  move(inAir: boolean, bulletType: BulletType = BulletType.None): void {
    this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;

    if (inAir) {
      this.ridgeBody.instanceVelocity.x = this.facingRight
        ? this.options.midAirNudgeSpeed
        : -this.options.midAirNudgeSpeed;
    } else {
      this.ridgeBody.instanceVelocity.x = this.facingRight ? this.options.runSpeed : -this.options.runSpeed;
      this.runAnimation.start(this.facingRight);
    }

    if (bulletType != BulletType.None) {
      this.runAnimation.shooting();
      this.shooting = true;
      const startPos = new vec3(this.ridgeBody.left, this.ridgeBody.bottom, 0);
      startPos.y += 48;
      startPos.x += this.ridgeBody.width * 0.5 + (this.facingRight ? 25 : -35);
      startPos.z = this.sprite.depth - 0.001;

      const speed = this.options.bulletSpeed; // m/second
      const velocity = new vec3(this.facingRight ? speed : -speed, 0, 0);
      this.eng.bullets.addBullet({
        bulletType,
        position: startPos,
        velocity,
      });
    }
  }

  jump(): void {
    if (this.midAirJump > 0) {
      this.resetAnimations();
      this.jumpAnimation.start();
      this.ridgeBody.velocity.y = this.options.jumpSpeed;
      this.midAirJump--;
    }
  }

  shoot(bulletType: BulletType): void {
    this.shooting = true;
    const startPos = new vec3(this.ridgeBody.left, this.ridgeBody.bottom, 0);
    startPos.y += 45;
    startPos.x += this.ridgeBody.width * 0.5;
    startPos.z = this.sprite.depth - 0.001;

    const speed = this.options.bulletSpeed; // m/second
    const velocity = new vec3(this.facingRight ? speed : -speed, 0, 0);
    this.eng.bullets.addBullet({
      bulletType,
      position: startPos,
      velocity,
    });

    //TODO add argument for wallSlide, jump, dash, or default
    this.shootAnimation.start(this.facingRight).onDone(() => {
      this.shooting = false;
    });
  }

  /**
   *
   * @param up
   * @param animationComplete
   */
  teleport(up: boolean, animationComplete?: () => void): void {
    // stop all animations
    this.resetAnimations();

    // update teleport position
    this.teleportAnimation.groundLevel = this.ridgeBody.bottom;
    this.teleportAnimation.xOffset = this.ridgeBody.left;
    this.teleportAnimation.start(up).onDone(() => {
      if (animationComplete) {
        animationComplete();
      }

      if (!up) {
        this.ridgeBody.active = true;
      }
    });

    // reset physics
    this.resetPhysics(true);
    this.ridgeBody.active = false;

    // reset other flags
    this.shooting = false;
    this.midAirJump = this.options.midAirJumps;

    //TODO when called animation complete will change state
    /*
      if (this.teleportAnimation.isUp) {
        this.changeState(EntityStateFlags.Disable);
      } else {
        this.changeState(EntityStateFlags.Idle);
        this.ridgeBody.active = true;
      }
    */
  }

  hit(animationComplete?: () => void): void {
    this.resetAnimations();
    this.hitAnimation.start(this._facingDirection == Direction.Right);
    this.hitAnimation.onDone(animationComplete);

    this.resetPhysics(true);

    // reset other flags
    this.shooting = false;
    this.midAirJump = this.options.midAirJumps;
  }

  die(animationComplete: () => void): void {
    this.hit(animationComplete);
  }

  update(dt: number): void {
    if (this.sprite) {
      this.jumpAnimation.update(dt);
      this.teleportAnimation.update(dt);
      this.runAnimation.update(dt);
      this.shootAnimation.update(dt);
      this.hitAnimation.update(dt);
      this.recoveryAnimation.update(dt);

      // move when running
      if (this.controller.stateType == EntityStateFlags.Running) {
        this.ridgeBody.acceleration.x = this.options.runAcceleration * (this.facingRight ? 1 : -1);
        this.ridgeBody.instanceVelocity.x = this.options.runSpeed * (this.facingRight ? 1 : -1);
      }
    }
  }
}
