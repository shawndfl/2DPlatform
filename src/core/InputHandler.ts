import { Component } from './Component';
import vec2 from '../math/vec2';
import { Engine } from './Engine';
import { UserAction } from './UserAction';

/**
 * Used to pass input state to other classes.
 */
export interface InputState {
  action: UserAction;
  touchPoint: vec2;
}

/**
 * Translates keyboard and gamepad events to game actions
 */
export class InputHandler extends Component {
  hasGamePad: boolean;
  action: UserAction;
  touchPoint: vec2;

  constructor(eng: Engine) {
    super(eng);
    this.action = UserAction.None;
    this.hasGamePad = 'getGamepads' in navigator;
    console.debug('initializing input:');
    if (this.hasGamePad) {
      console.debug(' gamepad supported');

      window.addEventListener('gamepadconnected', (e) => {
        this.connectGamepad(e);
      });

      window.addEventListener('gamepaddisconnected', (e) => {
        this.disconnectGamepad(e);
      });
    } else {
      console.warn('gamepad not supported!');
    }

    window.addEventListener('keydown', (e) => {
      this.keydown(e);
    });
    window.addEventListener('keyup', (e) => {
      this.keyup(e);
    });

    if (!this.isTouchEnabled()) {
      console.debug(' mouse enabled');
      window.addEventListener('mouseup', (e) => {
        this.action = this.action | UserAction.Tap;

        this.touchPoint = new vec2(e.offsetX, e.offsetY);
        console.debug('mouse ' + this.touchPoint.x + ', ' + this.touchPoint.y);
      });
    } else {
      console.debug(' touch enabled');
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0 && e.touches[0].target === eng.gl.canvas) {
          this.action = this.action | UserAction.Tap;
          const t = e.touches[0].target as HTMLCanvasElement;

          this.touchPoint = new vec2(e.touches[0].pageX - t.clientTop, e.touches[0].screenY);
          console.debug('touch ' + this.touchPoint.x + ', ' + this.touchPoint.y, e);
        }
      });
    }
  }

  isTouchEnabled() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  keydown(e: KeyboardEvent) {
    //console.log('keyboard down', e);
    if (e.key == 'ArrowRight') {
      this.action = this.action | UserAction.Right;
    }

    if (e.key == 'ArrowLeft') {
      this.action = this.action | UserAction.Left;
    }

    if (e.key == 'ArrowUp') {
      this.action = this.action | UserAction.Up;
    }

    if (e.key == 'ArrowDown') {
      this.action = this.action | UserAction.Down;
    }

    if (e.key == ' ') {
      this.action = this.action | UserAction.Action;
    }

    if (e.key == 'Enter') {
      this.action = this.action | UserAction.Menu;
    }

    if (e.key == 'Backspace') {
      this.action = this.action | UserAction.Cancel;
    }
  }

  keyup(e: KeyboardEvent) {
    //console.log('keyboard up ', e);
    if (e.key == 'ArrowRight') {
      this.action = this.action & ~UserAction.Right;
      this.action = this.action | UserAction.RightPressed;
    }

    if (e.key == 'ArrowLeft') {
      this.action = this.action & ~UserAction.Left;
      this.action = this.action | UserAction.LeftPressed;
    }

    if (e.key == 'ArrowUp') {
      this.action = this.action & ~UserAction.Up;
      this.action = this.action | UserAction.UpPressed;
    }

    if (e.key == 'ArrowDown') {
      this.action = this.action & ~UserAction.Down;
      this.action = this.action | UserAction.DownPressed;
    }

    if (e.key == ' ') {
      this.action = this.action & ~UserAction.Action;
      this.action = this.action | UserAction.ActionPressed;
    }

    if (e.key == 'Enter') {
      this.action = this.action & ~UserAction.Menu;
      this.action = this.action | UserAction.MenuPressed;
    }

    if (e.key == 'Backspace') {
      this.action = this.action & ~UserAction.Cancel;
      this.action = this.action | UserAction.CancelPressed;
    }
  }

  preUpdate(dt: number) {
    // Always call `navigator.getGamepads()` inside of
    // the game loop, not outside.
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // Disregard empty slots.
      if (!gamepad) {
        continue;
      }

      //TODO capture state from game pads
    }
  }

  postUpdate(dt: number) {
    // reset press actions
    this.action = this.action & ~UserAction.LeftPressed;
    this.action = this.action & ~UserAction.RightPressed;
    this.action = this.action & ~UserAction.UpPressed;
    this.action = this.action & ~UserAction.DownPressed;

    this.action = this.action & ~UserAction.ActionPressed;
    this.action = this.action & ~UserAction.CancelPressed;
    this.action = this.action & ~UserAction.MenuPressed;

    // reset tap
    this.action = this.action & ~UserAction.Tap;
  }

  connectGamepad(e: GamepadEvent) {
    console.log('✅ 🎮 A gamepad was connected:', e.gamepad);
  }

  disconnectGamepad(e: GamepadEvent) {
    console.debug('Gamepad disconnected', e.gamepad);
  }
}
