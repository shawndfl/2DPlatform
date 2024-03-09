import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import vec3 from '../../math/vec3';
import { RidgeBody } from '../../physics/RidgeBody';
import { PlatformEngine } from '../PlatformEngine';
import { BulletType } from '../components/BulletType';
import { Direction } from '../components/Direction';
import { GameComponent } from '../components/GameComponent';
import { HitAnimation } from '../components/HitAnimation';
import { JumpAnimation } from '../components/JumpAnimation';
import { RunAnimation } from '../components/RunAnimation';
import { ShootAnimation } from '../components/ShootAnimation';
import { TeleportAnimation } from '../components/TeleportAnimation';
import { IEntityState } from './IEntityState';
import { StateDead } from './StateDead';
import { StateDisable } from './StateDisable';
import { StateFalling } from './StateFalling';
import { StateFirstJump } from './StateFirstJump';
import { StateHit } from './StateHit';
import { StateIdle } from './StateIdle';
import { StateMidAirJump } from './StateMidAirJump';
import { StateRecovery } from './StateRecovery';
import { StateRunning } from './StateRunning';
import { StateSlidingDownWall } from './StateSlidingDownWall';
import { StateTeleportDown } from './StateTeleportDown';
import { StateTeleportUp } from './StateTeleportUp';

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
  runSpeed: number = 1;
  runAcceleration: number = 0.9;
  runMaxSpeed: number = 4;
  jumpSpeed: number = 3.5;
  midAirJumps: number = 1;
  midAirNudge: number = 1;
  bulletSpeed: number = 5;
  dieDelayMs: number = 0;
  facingDirection: Direction = Direction.Left;
}

export class EntityStateController extends GameComponent {
  private _state: EntityStateFlags;
  private teleportAnimation: TeleportAnimation;
  private runAnimation: RunAnimation;
  private shootAnimation: ShootAnimation;
  private jumpAnimation: JumpAnimation;
  private hitAnimation: HitAnimation;

  private options: EntityStateOptions;

  //State
  private stateDisable: StateDisable;
  private stateIdle: StateIdle;
  private stateRunning: StateRunning;
  private stateFalling: StateFalling;
  private stateFirstJump: StateFirstJump;
  private stateMidAirJump: StateMidAirJump;
  private stateSlidingDownWall: StateSlidingDownWall;
  private stateHit: StateHit;
  private stateRecovery: StateRecovery;
  private stateDead: StateDead;
  private stateTeleportUp: StateTeleportUp;
  private stateTeleportDown: StateTeleportDown;

  private currentState: IEntityState;

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

  /** Must be on a floor to start a jump */
  private _shooting: boolean;

  /** How many mid air jumps can we do */
  private _midAirJump: number;

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
    this.runAnimation = new RunAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);

    // create state
    this.stateDisable = new StateDisable(this);
    this.stateIdle = new StateIdle(this);
    this.stateRunning = new StateRunning(this);
    this.stateFalling = new StateFalling(this);
    this.stateFirstJump = new StateFirstJump(this);
    this.stateMidAirJump = new StateMidAirJump(this);
    this.stateSlidingDownWall = new StateSlidingDownWall(this);
    this.stateHit = new StateHit(this);
    this.stateRecovery = new StateRecovery(this);
    this.stateDead = new StateDead(this);
    this.stateTeleportUp = new StateTeleportUp(this);
    this.stateTeleportDown = new StateTeleportDown(this);

    this.currentState = this.stateDisable;

    this._facingDirection = Direction.Right;
    this._midAirJump = 0;
    this._shooting = false;
  }

  initialize(
    sprite: ISprite,
    ridgeBody: RidgeBody,
    options: EntityStateOptions
  ): void {
    this.changeState(EntityStateFlags.Disable);
    this.sprite = sprite;
    this.ridgeBody = ridgeBody;
    this.options = options;

    this.ridgeBody.maxVelocity = new vec3(options.runMaxSpeed, 1000, 1000);
    this.ridgeBody.minVelocity = new vec3(-options.runMaxSpeed, -1000, -1000);
    this._facingDirection = options.facingDirection;
    this._midAirJump = options.midAirJumps;
    this._shooting = false;

    // initialize animations
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.runAnimation = new RunAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);

    this.teleportAnimation.initialize(this.sprite);
    this.runAnimation.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite, this.options.dieDelayMs);
  }

  idle(): void {
    this.currentState.idle();
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        break;
      case EntityStateFlags.Running:
        this.ridgeBody.velocity.y = 0;
        this.runAnimation.stop();
        this.sprite.spriteImage('default');
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
        break;
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
        this.ridgeBody.active = true;
        this.sprite.top = this.hitAnimation.initialTop;
        this.sprite.spriteImage('default');
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  falling(): void {
    this.currentState.falling();
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this.ridgeBody.velocity.y = 0;
        this.changeState(EntityStateFlags.Falling);
        this.sprite.spriteImage('jumping.6');
        break;
      case EntityStateFlags.Running:
        this.ridgeBody.velocity.y = 0;
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
    this.currentState.landed();
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        if (!this._shooting) {
          this.sprite.spriteImage('default');
          this.changeState(EntityStateFlags.Idle);
        }
        break;
      case EntityStateFlags.Running:
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
        this.sprite.spriteImage('default');
        this.jumpAnimation.stop();
        this.changeState(EntityStateFlags.Idle);
        this._midAirJump = this.options.midAirJumps;
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

  stopJumping(): void {
    this.currentState.stopJumping();
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
      case EntityStateFlags.SlidingDownWall:
        this.ridgeBody.velocity.y = 0;
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

  /**
   * The player stops moving by releasing the arrow keys or stops jumping
   * @returns
   */
  stopMoving(): void {
    this.currentState.stopMoving();
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        break;
      case EntityStateFlags.Running:
        this.sprite.spriteImage('default');
        this.runAnimation.stop();
        this.ridgeBody.velocity.x = 0;
        this.ridgeBody.instanceVelocity.x = 0;
        this.ridgeBody.acceleration.x = 0;
        this.changeState(EntityStateFlags.Idle);
        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
        this.ridgeBody.velocity.x = 0;
        this.ridgeBody.instanceVelocity.x = 0;
        this.ridgeBody.acceleration.x = 0;
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
    this.currentState.slidingDown(right);
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
    this.currentState.move(right);

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
  jump(): void {
    this.currentState.jump();
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this.changeState(EntityStateFlags.FirstJump);
        this.ridgeBody.velocity.y = this.options.jumpSpeed;
        this.jumpAnimation.start(this.facingRight);

        break;
      case EntityStateFlags.Running:
        this.changeState(EntityStateFlags.FirstJump);
        this.ridgeBody.velocity.y = this.options.jumpSpeed;
        this.runAnimation.stop();
        this.jumpAnimation.start(this.facingRight);

        break;
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
        // we are starting a mid air jump
        if (this._midAirJump > 0) {
          this._midAirJump--;
          this.changeState(EntityStateFlags.MidAirJump);
          this.ridgeBody.velocity.y = this.options.jumpSpeed;
          this.runAnimation.stop();
          this.jumpAnimation.start(this.facingRight);
        }
        break;
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

  shoot(bulletType: BulletType): void {
    this.currentState.shoot(bulletType);
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
        this._shooting = true;
        const startPos = new vec3(
          this.ridgeBody.left,
          this.ridgeBody.bottom,
          0
        );
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
    this.currentState.teleport(up);
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

  hit(animationComplete: () => void): void {
    this.currentState.hit(animationComplete);
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
        this.hitAnimation.onDone(animationComplete);
        this.runAnimation.stop();
        this.ridgeBody.active = false;
        this.changeState(EntityStateFlags.Hit);
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

  die(animationComplete: () => void): void {
    this.currentState.die(animationComplete);
    switch (this._state) {
      case EntityStateFlags.Disable:
        break;
      case EntityStateFlags.Idle:
      case EntityStateFlags.Running:
      case EntityStateFlags.Falling:
      case EntityStateFlags.FirstJump:
      case EntityStateFlags.MidAirJump:
      case EntityStateFlags.SlidingDownWall:
      case EntityStateFlags.Hit:
      case EntityStateFlags.Recovery:
        this.changeState(EntityStateFlags.Dead);
        this.hitAnimation
          .start(this._facingDirection == Direction.Right)
          .onDone(animationComplete);
        this.runAnimation.stop();
        this.ridgeBody.active = false;
        break;
      case EntityStateFlags.Dead:
      case EntityStateFlags.TeleportUp:
      case EntityStateFlags.TeleportDown:
        break;
      default:
        console.error('unknown state!');
    }
  }

  public changeState(nextState: EntityStateFlags): void {
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
        this.ridgeBody.acceleration.x =
          this.options.runAcceleration * (this.facingRight ? 1 : -1);
        this.ridgeBody.instanceVelocity.x =
          this.options.runSpeed * (this.facingRight ? 1 : -1);
      }
    }
  }
}
