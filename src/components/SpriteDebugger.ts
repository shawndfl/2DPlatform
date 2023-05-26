import { Engine } from '../core/Engine';
import { ISpriteData } from '../graphics/ISpriteData';
import { Texture } from '../graphics/Texture';
import { UserAction } from '../core/UserAction';
import { PlayerController } from './PlayerController';
import { InputState } from '../core/InputHandler';

/**
 * Controls the player sprite.
 */
export class SpriteDebugger extends PlayerController {
  constructor(eng: Engine) {
    super(eng);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    super.initialize(spriteSheet, characterData);

    this._spriteController.setSpritePosition(10, 300, 0);
    this._spriteController.setSprite('ness.left.stand');
    this._spriteController.commitToBuffer();
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    if ((state.action & UserAction.ActionPressed) == UserAction.ActionPressed) {
      this._spriteController.rotate(this._spriteController.rotation + 10);
      this._spriteController.commitToBuffer();
    }

    if ((state.action & UserAction.LeftPressed) == UserAction.LeftPressed) {
      let index = this._spriteController.selectedSpriteIndex - 1;
      if (index < 0) {
        index = this._spriteController.spriteCount - 1;
      }

      this._spriteController.setSprite(index);

      console.debug('Showing ' + this._spriteController.selectedSpriteId);
      //this._direction = SpriteDirection.Left;
    } else if (state.action & UserAction.RightPressed) {
      let index = this._spriteController.selectedSpriteIndex + 1;
      if (index >= this._spriteController.spriteCount) {
        index = 0;
      }

      this._spriteController.setSprite(index);

      console.debug('Showing ' + this._spriteController.selectedSpriteId);
      //this._direction = SpriteDirection.Right;
    } else if (state.action == UserAction.UpPressed) {
    } else if (state.action == UserAction.DownPressed) {
    } else if (state.action == UserAction.ActionPressed) {
    }

    return false;
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
