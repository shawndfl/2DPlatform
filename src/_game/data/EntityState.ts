import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { RidgeBody } from '../../physics/RidgeBody';
import { PlatformEngine } from '../PlatformEngine';
import { Direction } from '../components/Direction';
import { GameComponent } from '../components/GameComponent';
import { HitAnimation } from '../components/HitAnimation';
import { JumpAnimation } from '../components/JumpAnimation';
import { ShootAnimation } from '../components/ShootAnimation';
import { TeleportAnimation } from '../components/TeleportAnimation';
import { WalkAnimation } from '../components/WalkAnimation';

/**
 * State an entity can be in
 */
export enum EntityStateFlags {
  Disable /** the player is hidden. Like before they get teleported in. */,
  Idle,
  Running,
  Falling,
  FirstJump,
  MidAirJump,
  SlidingDownWall,
  Hit,
  Recovery,
  Dead,
  TeleportUp,
  TeleportDown,
}

export class EntityStateOptions {
  runSpeed: number = 2;
  runAcceleration: number = 0.1;
  runMaxSpeed: number = 3;
  jumpSpeed: number = 3.5;
  midAirJumps: number = 1;
  midAirNudge: number = 3;
}

export class EntityState extends GameComponent {
  private _state: EntityStateFlags;
  private teleportAnimation: TeleportAnimation;
  private runAnimation: WalkAnimation;
  private shootAnimation: ShootAnimation;
  private jumpAnimation: JumpAnimation;
  private hitAnimation: HitAnimation;

  private options: EntityStateOptions;

  /**
   * Sprite that we will be animating
   */
  private sprite: ISprite;
  /**
   * RidgeBody we will be manipulating
   */
  private ridgeBody: RidgeBody;

  /**
   * What direction is the entity facing
   */
  private _facingDirection: Direction;

  /** a new jump can start after the jump button is released */
  private _jumpReset: boolean;
  /** Must be on a floor to start a jump */
  private _touchingFloor: boolean;
  private _shooting: boolean;

  /** How many mid air jumps can we do */
  private _midAirJump: number;
  private readonly maxMidAirJumps = 1;

  public get facingDirection(): Direction {
    return this._facingDirection;
  }

  public get facingRight(): boolean {
    return this._facingDirection == Direction.Right;
  }

  public onStateChange: (
    before: EntityStateFlags,
    after: EntityStateFlags
  ) => void;

  public shooting(): boolean {
    return this._shooting;
  }

  public state(): EntityStateFlags {
    return this._state;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.runAnimation = new WalkAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);

    this._facingDirection = Direction.Right;
    this._touchingFloor = false;
    this._midAirJump = 0;
    this._shooting = false;
  }

  initialize(
    sprite: ISprite,
    ridgeBody: RidgeBody,
    options: EntityStateOptions
  ): void {
    this.changeState(EntityStateFlags.Idle);
    this.sprite = sprite;
    this.ridgeBody = ridgeBody;
    this.options = options;

    this._facingDirection = Direction.Right;
    this._touchingFloor = false;
    this._midAirJump = options.midAirJumps;
    this._shooting = false;

    // initialize animations
    this.teleportAnimation.initialize(this.sprite);
    this.runAnimation.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite);
  }

  falling(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this.ridgeBody.instanceVelocity.y = 0;
        this.changeState(EntityStateFlags.Falling);
        this.sprite.spriteImage('jumping.6');
        break;
      case EntityStateFlags.Running:
        this.ridgeBody.instanceVelocity.y = 0;
        this.runAnimation.stop();
        this.changeState(EntityStateFlags.Falling);
        this.sprite.spriteImage('jumping.6');
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  /**
   * The entity is now on the ground
   */
  landed(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this.sprite.spriteImage('default');
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.Running:
        break;
      case EntityStateFlags.Falling:
        this.sprite.spriteImage('default');
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.FirstJump:
        break;
      case EntityStateFlags.MidAirJump:
        break;
      case EntityStateFlags.SlidingDownWall:
        this.sprite.spriteImage('default');
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  /**
   * The player stops moving by releasing the arrow keys or stops jumping
   * @returns
   */
  stopMoving(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        break;
      case EntityStateFlags.Running:
        this.sprite.spriteImage('default');
        this.runAnimation.stop();
        this.ridgeBody.instanceVelocity.x = 0;
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.Falling:
        this.ridgeBody.instanceVelocity.x = 0;
        break;
      case EntityStateFlags.FirstJump:
        this.jumpAnimation.stop();
        this.ridgeBody.instanceVelocity.y = 0;
        this.changeState(EntityStateFlags.Falling);
        break;
      case EntityStateFlags.MidAirJump:
        this.ridgeBody.instanceVelocity.y = 0;
        this.changeState(EntityStateFlags.Falling);
        break;
      case EntityStateFlags.SlidingDownWall:
        this.ridgeBody.instanceVelocity.y = 0;
        this.changeState(EntityStateFlags.Falling);
        break;
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  slidingDown(right: boolean): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        break;
      case EntityStateFlags.Running:
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
        this.changeState(EntityStateFlags.SlidingDownWall);
        break;
      case EntityStateFlags.SlidingDownWall:
        break;
      case EntityStateFlags.Hit:
        break;
      case EntityStateFlags.Recovery:
        break;
      case EntityStateFlags.Dead:
        break;
      case EntityStateFlags.TeleportUp:
        break;
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  move(right: boolean): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this._facingDirection = right ? Direction.Right : Direction.Left;
        this.sprite.flipDirection = right ? SpriteFlip.None : SpriteFlip.XFlip;
        this.runAnimation.start(this.facingRight);
        this.changeState(EntityStateFlags.Running);
        break;
      case EntityStateFlags.Running:
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
        this._facingDirection = right ? Direction.Right : Direction.Left;
        this.sprite.flipDirection = right ? SpriteFlip.None : SpriteFlip.XFlip;
        this.ridgeBody.instanceVelocity.x = right
          ? this.options.midAirNudge
          : -this.options.midAirNudge;
        break;
      case EntityStateFlags.SlidingDownWall:
        break;
      case EntityStateFlags.Hit:
        break;
      case EntityStateFlags.Recovery:
        break;
      case EntityStateFlags.Dead:
        break;
      case EntityStateFlags.TeleportUp:
        break;
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }
  landing(): void {}

  jump(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this.changeState(EntityStateFlags.FirstJump);
        this.ridgeBody.instanceVelocity.y = this.options.jumpSpeed;
        this.jumpAnimation.start(this.facingRight);
        break;
      case EntityStateFlags.Running:
        this.changeState(EntityStateFlags.FirstJump);
        this.ridgeBody.instanceVelocity.y = this.options.jumpSpeed;
        this.runAnimation.stop();
        this.jumpAnimation.start(this.facingRight);
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  shoot(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this._shooting = true;
        this.shootAnimation.start(this.facingRight).onDone(() => {
          this._shooting = false;
        });
        break;
      case EntityStateFlags.Running:
        break;
      case EntityStateFlags.Falling:
        break;
      case EntityStateFlags.FirstJump:
        break;
      case EntityStateFlags.MidAirJump:
        break;
      case EntityStateFlags.SlidingDownWall:
        break;
      case EntityStateFlags.Hit:
        break;
      case EntityStateFlags.Recovery:
        break;
      case EntityStateFlags.Dead:
        break;
      case EntityStateFlags.TeleportUp:
        break;
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  teleport(up: boolean): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
      case EntityStateFlags.Idle:
        this.changeState(
          up ? EntityStateFlags.TeleportUp : EntityStateFlags.TeleportDown
        );

        this.ridgeBody.active = false;
        // update teleport position
        this.teleportAnimation.groundLevel = this.ridgeBody.bottom;
        this.teleportAnimation.xOffset = this.ridgeBody.left;

        this.teleportAnimation.start(up).onDone(() => {
          if (this.teleportAnimation.isUp) {
            this.changeState(EntityStateFlags.Disable);
          } else {
            this.changeState(EntityStateFlags.Idle);
            this.ridgeBody.active = true;
          }
        });
        break;
      case EntityStateFlags.Running:
        break;
      case EntityStateFlags.Falling:
        break;
      case EntityStateFlags.FirstJump:
        break;
      case EntityStateFlags.MidAirJump:
        break;
      case EntityStateFlags.SlidingDownWall:
        break;
      case EntityStateFlags.Hit:
        break;
      case EntityStateFlags.Recovery:
        break;
      case EntityStateFlags.Dead:
        break;
      case EntityStateFlags.TeleportUp:
        break;
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  hit(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
      case EntityStateFlags.Running:
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
        this.hitAnimation.start(this._facingDirection == Direction.Right);
        this.runAnimation.stop();
        this.ridgeBody.active = false;
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  die(): void {
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
      case EntityStateFlags.Running:
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
        this.changeState(EntityStateFlags.Dead);
        this.hitAnimation
          .start(this._facingDirection == Direction.Right)
          .onDone((c) => {
            this.eng.sceneManager.setNextScene('level.2.0');
          });
        this.runAnimation.stop();
        this.ridgeBody.active = false;
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  private changeState(nextState: EntityStateFlags): void {
    // make sure we set the shooting flag
    let next = nextState;
    if (this.onStateChange) {
      this.onStateChange(this._state, next);
    }
    this._state = next;
  }

  /**
   * Updates all the animations for what ever state the entity is in
   * @param dt
   */
  update(dt: number): void {
    if (this.sprite) {
      this.jumpAnimation.update(dt);
      this.teleportAnimation.update(dt);
      this.runAnimation.update(dt);
      this.shootAnimation.update(dt);
      this.hitAnimation.update(dt);

      // move when running
      if (this._state == EntityStateFlags.Running) {
        this.ridgeBody.instanceVelocity.x =
          this.options.runSpeed * (this.facingRight ? 1 : -1);
      }
    }
  }
}
