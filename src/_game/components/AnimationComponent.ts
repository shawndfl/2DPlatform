import { ISprite } from '../../graphics/ISprite';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { EntityState } from '../data/EntityState';
import { GameComponent } from './GameComponent';

/**
 * An animation component that runs different animations
 */
export abstract class AnimationComponent extends GameComponent {
  public entityState: EntityState;

  abstract initialize(sprite: ISprite): void;

  abstract start(backwards: boolean): void;

  abstract stop(): void;

  abstract update(dt: number): void;
}
