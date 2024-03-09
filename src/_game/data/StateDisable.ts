import { BulletType } from '../components/BulletType';
import {
  EntityStateController,
  EntityStateFlags,
} from './EntityStateController';
import { IEntityState } from './IEntityState';

/**
 * When disable the only way out is to teleport in
 */
export class StateDisable implements IEntityState {
  constructor(private _controller: EntityStateController) {}

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {}
  idle(): void {}
  falling(): void {}
  landed(): void {}
  stopJumping(): void {}
  stopMoving(): void {}
  slidingDown(right: boolean): void {}
  move(right: boolean): void {}
  jump(): void {}
  shoot(bulletType: BulletType): void {}
  teleport(up: boolean): void {
    if (!up) {
      //this.controller.changeState(EntityStateFlags.TeleportDown);
    }
  }
  hit(animationComplete: () => void): void {}
  die(animationComplete: () => void): void {}
}
