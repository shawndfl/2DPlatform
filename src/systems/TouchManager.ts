import { Component } from '../components/Component';
import { TouchSurfaceEvent } from '../components/TouchSurfaceEvent';
import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { UserAction } from '../core/UserAction';
import vec2 from '../math/vec2';

/**
 * Manages the touch events for the game. This will register touch surfaces (places the user can touch)
 * and raise events to different touch handlers.
 */
export class TouchManager extends Component {
  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    if ((state.action & UserAction.Tap) > 0) {
      const touchSurfaceEvent = new TouchSurfaceEvent(state.touchPoint);
      this.hitTest(touchSurfaceEvent);

      this.handleTouchEvent(touchSurfaceEvent);
    } else {
      return false;
    }
  }

  /**
   * Do a hit test and collect all hit surfaces
   * @param state
   * @returns
   */
  hitTest(e: TouchSurfaceEvent) {
    this.eng.scene.ground.hitTest(e);
  }

  /**
   * Raise Touch event
   * @param touch
   */
  handleTouchEvent(e: TouchSurfaceEvent): boolean {
    if (e.hitSurfaces.length == 0) {
      return false;
    } else {
      console.debug('handling touches ', e);
      //TODO sort z-index surfaces
      // check enabled
      // raise on touch event
    }
  }

  /**
   * Used to draw the touch points for debugging.
   * @param dt
   */
  update(dt: number) {}
}
