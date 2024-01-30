import { ISprite } from '../../graphics/ISprite';
import { PlatformEngine } from '../PlatformEngine';
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
  None,
  Idle,
  Running,
  Falling,
  Jumping,
  SlidingDownWall,
  OffGround = Falling | Jumping | SlidingDownWall,
  Hit,
  Dead,
  TeleportUp,
  TeleportDown,
  Teleporting = TeleportDown | TeleportUp,

  Shooting = 0x1000,
  ExtraMask = 0xf000,
}

export class EntityState extends GameComponent {
  private _shooting: boolean;
  private _state: EntityStateFlags;
  private teleportAnimation: TeleportAnimation;
  private walk: WalkAnimation;
  private shootAnimation: ShootAnimation;
  private jumpAnimation: JumpAnimation;
  private hitAnimation: HitAnimation;
  private sprite: ISprite;

  public shooting(): boolean {
    return this._shooting;
  }

  public state(): EntityStateFlags {
    return this._state;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.walk = new WalkAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.jumpAnimation = new JumpAnimation(this.eng);
    this.hitAnimation = new HitAnimation(this.eng);
  }

  initialize(sprite: ISprite): void {
    this._state = EntityStateFlags.Idle;
    this._shooting = false;
    this.sprite = sprite;
    this.teleportAnimation.initialize(this.sprite);
    this.walk.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);
    this.hitAnimation.initialize(this.sprite);
  }

  setOffGround(): void {}
  moveLeft(): void {}
  moveRight(): void {}
  jump(): void {}
  shoot(): void {}
  teleportUp(): void {}
  teleportDown(): void {}
  hit(): void {}
  die(): void {}

  update(dt: number): void {
    this.jumpAnimation.update(dt);
    this.teleportAnimation.update(dt);
    this.walk.update(dt);
    this.shootAnimation.update(dt);
    this.hitAnimation.update(dt);
  }
}
