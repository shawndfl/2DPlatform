import { SpriteFlip } from '../../graphics/ISprite';
import { BulletType } from '../components/BulletType';
import { Direction } from '../components/Direction';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateFirstJump implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get type(): EntityStateFlags {
    return EntityStateFlags.FirstJump;
  }

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {}
  idle(): void {}

  landed(): void {
    this.actions.landed();
    this.controller.setState(EntityStateFlags.Idle);
  }
  stopJumping(): void {
    this.actions.stopJumping();
    this.controller.setState(EntityStateFlags.Falling);
  }
  stopMoving(): void {}
  slidingDown(right: boolean): void {}
  move(right: boolean): void {
    this.actions.faceDirection(right);
    this.actions.move(true);
  }
  jump(): void {
    //Mid air jump is handled in falling, because as soon as the jump is released
    // we will move into the falling state
  }

  shoot(bulletType: BulletType): void {}
  teleport(up: boolean): void {}
  hit(animationComplete: () => void): void {
    this.controller.setState(EntityStateFlags.Hit);
    this.actions.hit(animationComplete);
  }
  die(animationComplete: () => void): void {
    this.controller.setState(EntityStateFlags.Dead);
    this.actions.die(animationComplete);
  }
}
