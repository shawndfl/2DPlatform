import { SpriteFlip } from '../../graphics/ISprite';
import { BulletType } from '../components/BulletType';
import { Direction } from '../components/Direction';
import { EntityStateActions } from './EntityStateActions';
import { EntityStateController, EntityStateFlags } from './EntityStateController';
import { IEntityState } from './IEntityState';

export class StateMidAirJump implements IEntityState {
  constructor(private _controller: EntityStateController, private actions: EntityStateActions) {}

  get type(): EntityStateFlags {
    return EntityStateFlags.MidAirJump;
  }

  get controller(): EntityStateController {
    return this._controller;
  }

  disabled(): void {
    throw new Error('Method not implemented.');
  }
  idle(): void {
    throw new Error('Method not implemented.');
  }

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
  jump(): void {}
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
