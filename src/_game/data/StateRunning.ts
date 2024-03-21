import { BulletType } from '../components/BulletType';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateRunning implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get type(): EntityStateFlags {
    return EntityStateFlags.Running;
  }

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {}

  idle(): void {
    this.actions.idle();
    this.controller.setState(EntityStateFlags.Idle);
  }

  landed(): void {}

  stopJumping(): void {}

  stopMoving(): void {
    this.actions.setDefault();
    this.actions.stopMoving();
    this.controller.setState(EntityStateFlags.Idle);
  }

  slidingDown(right: boolean): void {
    throw new Error('Method not implemented.');
  }

  move(right: boolean): void {
    this.actions.faceDirection(right);
    this.actions.move(false);
  }

  jump(): void {
    this.actions.jump();
    this.controller.setState(EntityStateFlags.FirstJump);
  }

  shoot(bulletType: BulletType): void {
    this.actions.move(false, bulletType);
  }

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
