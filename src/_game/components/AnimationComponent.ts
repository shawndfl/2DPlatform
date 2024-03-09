import { ISprite } from '../../graphics/ISprite';
import { GameComponent } from './GameComponent';

/**
 * An animation component that runs different animations
 */
export abstract class AnimationComponent extends GameComponent {
  protected _onDone: () => void;

  onDone(done: () => void): AnimationComponent {
    this._onDone = done;
    return this;
  }

  protected raiseOnDone(): void {
    if (this._onDone) {
      this._onDone();
    }
  }

  abstract initialize(sprite: ISprite): void;

  abstract start(backwards: boolean): void;

  abstract stop(): void;

  abstract update(dt: number): void;
}
