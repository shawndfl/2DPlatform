import { BulletType } from '../components/BulletType';
import { EntityStateController } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateRunning implements IEntityState {
  constructor(private _controller: EntityStateController) {}

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {
    throw new Error('Method not implemented.');
  }
  idle(): void {
    throw new Error('Method not implemented.');
  }
  falling(): void {
    throw new Error('Method not implemented.');
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
