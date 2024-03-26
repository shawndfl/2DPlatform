import { BulletType } from '../components/BulletType';
import { EntityStateController, EntityStateFlags } from './EntityStateController';

/**
 * This interface is used by the player or enemy controller
 */
export interface IEntityState {
  /**
   * Get the controller. used to set state
   */
  get controller(): EntityStateController;

  /**
   * get the state flag
   */
  get type(): EntityStateFlags;

  /**
   * The entity is disabled
   */
  disabled(): void;

  /**
   * The entity is not doing anything or just finished an action and is waiting
   */
  idle(): void;

  /**
   * The entity is now on the ground
   */
  landed(): void;

  /**
   * The jump action was interrupted and the entity must start falling
   */
  stopJumping(): void;

  /**
   * The player stops moving by releasing the arrow keys or stops jumping
   * @returns
   */
  stopMoving(): void;

  /**
   * Sliding down a wall
   * @param right
   */
  slidingDown(right: boolean): void;

  /**
   * Move to the right or left
   * @param right
   */
  move(right: boolean): void;

  /**
   * begin the jump action. This requires the landed function to be call at some point
   */
  jump(): void;

  /**
   * Shoot
   * @param bulletType
   */
  shoot(bulletType: BulletType): void;

  /**
   * teleport
   * @param up
   */
  teleport(up: boolean): void;

  /**
   * Entity is hit
   * @param animationComplete
   */
  hit(animationComplete: () => void): void;

  /**
   * The entity died
   * @param animationDone
   */
  die(animationComplete: () => void): void;
}
