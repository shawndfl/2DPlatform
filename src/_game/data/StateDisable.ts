import { BulletType } from '../components/BulletType';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

/**
 * When disable the only way out is to teleport in
 */
export class StateDisable implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get type(): EntityStateFlags {
    return EntityStateFlags.Disable;
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

  teleport(up: boolean): void {
    this.controller.setState(EntityStateFlags.TeleportUp);
    this.actions.teleport(up, () => {
      if (!up) {
        this.controller.setState(EntityStateFlags.Idle);
      } else {
        this.controller.setState(EntityStateFlags.Disable);
      }
    });
  }

  hit(animationComplete: () => void): void {}
  die(animationComplete: () => void): void {}
}
