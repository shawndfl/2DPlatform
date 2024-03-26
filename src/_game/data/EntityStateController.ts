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
import { EntityStateActions } from './EntityStateActions';
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
  Disable = 'Disable' /** the player is hidden. Like before they get teleported in. */,
  Idle = 'Idle',
  Running = 'Running',
  Falling = 'Falling',
  FirstJump = 'FirstJump',
  MidAirJump = 'MidAirJump',
  SlidingDownWall = 'SlidingDownWall',
  Hit = 'Hit',
  Recovery = 'Recovery',
  Dead = 'Dead',
  TeleportUp = 'teleportUp',
  TeleportDown = 'TeleportDown',
}

/**
 * Options used to adjust state actions and configure
 * the EntityStateController
 */
export class EntityStateOptions {
  runSpeed: number = 1;
  runAcceleration: number = 0.9;
  runMaxSpeed: number = 4;
  jumpSpeed: number = 3.5;
  midAirJumps: number = 2;
  midAirNudgeSpeed: number = 1;
  bulletSpeed: number = 5;
  dieDelayMs: number = 0;
  facingDirection: Direction = Direction.Left;
  type: string;
}

export class EntityStateController extends GameComponent {
  private actions: EntityStateActions;

  //State
  private states: Map<EntityStateFlags, IEntityState> = new Map<EntityStateFlags, IEntityState>();

  private _state: IEntityState;

  private _options: EntityStateOptions;

  public get stateType(): EntityStateFlags {
    return this._state.type;
  }

  public get state(): IEntityState {
    return this._state;
  }

  constructor(eng: PlatformEngine) {
    super(eng);

    this.actions = new EntityStateActions(eng, this);
    // create state
    this.states.set(EntityStateFlags.Disable, new StateDisable(this, this.actions));
    this.states.set(EntityStateFlags.Idle, new StateIdle(this, this.actions));
    this.states.set(EntityStateFlags.Running, new StateRunning(this, this.actions));
    this.states.set(EntityStateFlags.Falling, new StateFalling(this, this.actions));
    this.states.set(EntityStateFlags.FirstJump, new StateFirstJump(this, this.actions));
    this.states.set(EntityStateFlags.MidAirJump, new StateMidAirJump(this, this.actions));
    this.states.set(EntityStateFlags.SlidingDownWall, new StateSlidingDownWall(this, this.actions));
    this.states.set(EntityStateFlags.Hit, new StateHit(this, this.actions));
    this.states.set(EntityStateFlags.Recovery, new StateRecovery(this, this.actions));
    this.states.set(EntityStateFlags.Dead, new StateDead(this, this.actions));
    this.states.set(EntityStateFlags.TeleportDown, new StateTeleportDown(this, this.actions));
    this.states.set(EntityStateFlags.TeleportUp, new StateTeleportUp(this, this.actions));

    // set initial state
    this._state = this.states.get(EntityStateFlags.Disable);
  }

  initialize(sprite: ISprite, ridgeBody: RidgeBody, options: EntityStateOptions): void {
    this._options = options;
    this.actions.initialize(sprite, ridgeBody, options);
  }

  idle(): void {
    this.state.idle();
  }

  /**
   * The entity is now on the ground
   */
  landed(): void {
    this.state.landed();
  }

  stopJumping(): void {
    this.state.stopJumping();
  }

  /**
   * After hit prevent a second hit for a while
   */
  recovery(animationComplete: () => void): void {
    this.actions.recovery(animationComplete);
  }

  /**
   * The player stops moving by releasing the arrow keys or stops jumping
   * @returns
   */
  stopMoving(): void {
    this.state.stopMoving();
  }

  slidingDown(right: boolean): void {
    this.state.slidingDown(right);
  }

  move(right: boolean): void {
    this.state.move(right);
  }

  jump(): void {
    this.state.jump();
  }

  shoot(bulletType: BulletType): void {
    this.state.shoot(bulletType);
  }

  teleport(up: boolean): void {
    this.state.teleport(up);
  }

  hit(animationComplete: () => void): void {
    this.state.hit(animationComplete);
  }

  die(animationComplete: () => void): void {
    this.state.die(animationComplete);
  }

  /**
   * Sets the state using the flags
   * @param type
   */
  setState(type: EntityStateFlags): void {
    if (this._options.type == 'player') {
      console.log('setting state ' + this._options.type + ' from ' + this.state.type + ' to ' + type);
    }
    this._state = this.states.get(type);
  }

  /**
   * Updates all the animations for what ever state the entity is in
   * @param dt
   */
  update(dt: number): void {
    this.actions.update(dt);
  }
}
