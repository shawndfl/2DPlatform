import { BulletType } from '../components/BulletType';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateDead implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get controller(): EntityStateController {
    return this._controller;
  }

  get type(): EntityStateFlags {
    return EntityStateFlags.Dead;
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
