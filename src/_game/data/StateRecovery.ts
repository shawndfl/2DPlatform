import { BulletType } from '../components/BulletType';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateRecovery implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get type(): EntityStateFlags {
    return EntityStateFlags.Recovery;
  }

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {
    this.controller.setState(EntityStateFlags.TeleportUp);
    this.actions.teleport(true, () => {
      this.controller.setState(EntityStateFlags.Disable);
    });
  }
  idle(): void {}

  landed(): void {}
  stopJumping(): void {}
  stopMoving(): void {}
  slidingDown(right: boolean): void {}
  move(right: boolean): void {
    this.controller.setState(EntityStateFlags.Running);
    this.actions.faceDirection(right);
    this.actions.move(false);
  }
  jump(): void {
    this.actions.jump();
    this.controller.setState(EntityStateFlags.FirstJump);
  }
  shoot(bulletType: BulletType): void {
    this.actions.shoot(bulletType);
  }

  teleport(up: boolean): void {
    this.controller.setState(up ? EntityStateFlags.TeleportUp : EntityStateFlags.TeleportDown);

    this.actions.teleport(up, () => {
      if (up) {
        this._controller.setState(EntityStateFlags.Disable);
      } else {
        this._controller.setState(EntityStateFlags.Idle);
      }
    });
  }
  hit(animationComplete: () => void): void {}
  die(animationComplete: () => void): void {}
}
