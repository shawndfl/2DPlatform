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
    throw new Error('Method not implemented.');
  }
  idle(): void {
    this.actions.idle();
    this.controller.setState(EntityStateFlags.Idle);
  }

  landed(): void {
    throw new Error('Method not implemented.');
  }
  stopJumping(): void {
    throw new Error('Method not implemented.');
  }
  stopMoving(): void {
    throw new Error('Method not implemented.');
  }
  slidingDown(right: boolean): void {
    throw new Error('Method not implemented.');
  }
  move(right: boolean): void {
    throw new Error('Method not implemented.');
  }
  jump(): void {
    throw new Error('Method not implemented.');
  }
  shoot(bulletType: BulletType): void {
    throw new Error('Method not implemented.');
  }
  teleport(up: boolean): void {
    throw new Error('Method not implemented.');
  }
  hit(animationComplete: () => void): void {
    throw new Error('Method not implemented.');
  }
  die(animationComplete: () => void): void {
    throw new Error('Method not implemented.');
  }
}
