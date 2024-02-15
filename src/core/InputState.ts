import vec2 from '../math/vec2';
import { UserAction } from './UserAction';

/**
 * Used to pass input state to other classes.
 */
export class InputState {
  /**
   * logical buttons
   */
  buttonsDown: UserAction;

  /**
   * The buttons that were just released
   */
  buttonsReleased: UserAction;

  /**
   * inputDown mouse or touch
   */
  inputDown: [number, number];

  /**
   * Only true for one frame when the mouse is released or touch point lifted
   */
  inputReleased: boolean;

  /**
   * Capture two touch points if they are there.
   */
  touchPoint: [vec2, vec2];

  /**
   * how many touch points are there.
   */
  touchCount: number;

  isReleased(btn: UserAction) {
    return (this.buttonsReleased & btn) > 0;
  }

  isDown(btn: UserAction) {
    return (this.buttonsDown & btn) > 0;
  }
}
