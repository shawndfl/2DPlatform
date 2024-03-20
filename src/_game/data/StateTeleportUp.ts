import { BulletType } from '../components/BulletType';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateTeleportUp implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get type(): EntityStateFlags {
    return EntityStateFlags.TeleportUp;
  }

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {}
  idle(): void {}

  landed(): void {}
  stopJumping(): void {}
  stopMoving(): void {}
  slidingDown(right: boolean): void {}
  move(right: boolean): void {}
  jump(): void {}
  shoot(bulletType: BulletType): void {}
  teleport(up: boolean): void {}
  hit(animationComplete: () => void): void {}
  die(animationComplete: () => void): void {}
}
