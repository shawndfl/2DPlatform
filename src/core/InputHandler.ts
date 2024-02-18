import { Component } from '../components/Component';
import rect from '../math/rect';
import { Engine } from './Engine';
import { GamepadInteraction, InputMappings } from './InputMappings';
import { InputState } from './InputState';
import { UserAction } from './UserAction';

const MouseId = 999;
const NoId = -1;

interface TouchAction {
  /** touch region */
  bounds: rect;
  /** the action to perform */
  action: UserAction;
}

interface TouchRect {
  /** a way to look up this touch rect */
  name: string;
  /** id of the touch point or mouseId */
  touchId: number;
  /** touch region */
  bounds: rect;
  /** the action to perform */
  action: UserAction;
  /** is the state of the touch down right now */
  isDown: boolean;
}

/**
 * Translates keyboard and gamepad events to game actions
 */
export class InputHandler extends Component {
  private _hasGamePad: boolean;

  /**
   * Used to map logical buttons to real keyboard or game pad buttons.
   */
  readonly mappingIndex;

  /**
   * Mapping for input
   */
  inputMappings: InputMappings;

  /**
   * touch location
   */
  private _touchRect: Map<string, TouchRect> = new Map<string, TouchRect>();

  /**
   * Name of the game pad
   */
  private _gamePadType: string;

  /**
   * logical buttons
   */
  buttonsDown: UserAction;

  /**
   * The buttons that were just released
   */
  buttonsReleased: UserAction;

  private _gamepad: Gamepad;
  private boundConnectGamepad: (e: GamepadEvent) => void;
  private boundDisconnectGamepad: (e: GamepadEvent) => void;

  get gamepad(): Gamepad {
    return this._gamepad;
  }

  constructor(eng: Engine) {
    super(eng);

    this.mappingIndex = {
      Start: 0,
      Select: 1,
      A: 2,
      B: 3,
      X: 4,
      Y: 5,
      Up: 6,
      Down: 7,
      Right: 8,
      Left: 9,
      TriggerR: 10,
      TriggerL: 11,
    };

    this.buttonsDown = UserAction.None;
    this.buttonsReleased = UserAction.None;
    this._hasGamePad = 'getGamepads' in navigator;
    console.debug('initializing input:');

    this.inputMappings = {
      gamePadMapping: new Map<string, GamepadInteraction[]>(),
    };

    window.addEventListener('keydown', (e) => {
      if (!this.eng.isActive) {
        return;
      }
      this.keydown(e);
    });
    window.addEventListener('keyup', (e) => {
      if (!this.eng.isActive) {
        return;
      }
      console.debug('key up ' + e.key);
      this.keyup(e);
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.eng.isActive) {
        return;
      }

      const canvas = this.eng.canvasController.canvas;
      const xScale = canvas.width / canvas.clientWidth;
      const yScale = canvas.height / canvas.clientHeight;

      const x = e.offsetX * xScale;
      const y = canvas.height - e.offsetY * yScale;
      this.pointerDown(MouseId, x, y);

      e.preventDefault();
    });
    window.addEventListener('mouseup', (e) => {
      if (!this.eng.isActive) {
        return;
      }

      const canvas = this.eng.canvasController.canvas;
      const xScale = canvas.width / canvas.clientWidth;
      const yScale = canvas.height / canvas.clientHeight;

      const x = e.offsetX * xScale;
      const y = canvas.height - e.offsetY * yScale;
      this.pointerUp(MouseId, x, y);

      e.preventDefault();
    });
    window.addEventListener('touchstart', (e) => {
      if (!this.eng.isActive) {
        return;
      }
      const canvas = this.eng.canvasController.canvas;
      const xScale = canvas.width / canvas.clientWidth;
      const yScale = canvas.height / canvas.clientHeight;

      for (let touch of e.touches) {
        const x = touch.pageX * xScale;
        const y = canvas.height - touch.pageY * yScale;
        this.pointerDown(touch.identifier, x, y);
      }
    });
    window.addEventListener('touchend', (e) => {
      if (!this.eng.isActive) {
        return;
      }
      const canvas = this.eng.canvasController.canvas;
      const xScale = canvas.width / canvas.clientWidth;
      const yScale = canvas.height / canvas.clientHeight;

      for (let touch of e.changedTouches) {
        const x = touch.pageX * xScale;
        const y = canvas.height - touch.pageY * yScale;
        this.pointerUp(touch.identifier, x, y);
      }
      e.preventDefault();
    });
    window.addEventListener('touchcancel', (e) => {
      if (!this.eng.isActive) {
        return;
      }

      const canvas = this.eng.canvasController.canvas;
      const xScale = canvas.width / canvas.clientWidth;
      const yScale = canvas.height / canvas.clientHeight;

      for (let touch of e.changedTouches) {
        const x = touch.pageX * xScale;
        const y = canvas.height - touch.pageY * yScale;
        this.pointerUp(touch.identifier, x, y);
      }
      e.preventDefault();
    });

    this.resetInput();
    this.loadMapping();
  }

  /**
   * Removes a touch rect
   * @param name
   */
  removeTouchRect(name: string): void {
    this._touchRect.delete(name);
  }

  /**
   * Add a touch rect
   * @param name
   * @param touchRect
   */
  setTouchRect(name: string, touchRect: TouchRect): void {
    touchRect.name = name;
    this._touchRect.set(name, touchRect);
  }

  /**
   * When something is touched set the buttonsDown for
   * the touch rect
   * @param x
   * @param y
   */
  pointerDown(id: number, x: number, y: number): void {
    const touchRect = this.getTouchRect(x, y);
    // set when down
    if (touchRect) {
      this.buttonsDown = this.buttonsDown | touchRect.action;
      touchRect.touchId = id;
    }
    console.debug('pointer Down: ' + id + ': ', x, y);
  }

  pointerUp(id: number, x: number, y: number): void {
    const touchRect = this.getTouchById(id);
    // set when released
    if (touchRect) {
      this.buttonsDown = this.buttonsDown & ~touchRect.action;
      this.buttonsReleased = this.buttonsReleased | touchRect.action;
      touchRect.touchId = NoId;
    }
    console.debug('pointer up: ' + id + ': ', x, y);
  }

  getTouchById(id: number): TouchRect {
    let touchRect: TouchRect;
    this._touchRect.forEach((t) => {
      if (t.touchId == id) {
        touchRect = t;
      }
    });
    return touchRect;
  }

  /**
   * Get the touch rect that this point hits
   * @param x
   * @param y
   * @returns
   */
  getTouchRect(x: number, y: number): TouchRect {
    let touchRect: TouchRect;
    // return a touch rect
    this._touchRect.forEach((v) => {
      if (v.bounds.pointInside(x, y)) {
        touchRect = v;
      }
    });
    return touchRect;
  }

  /**
   * Get a copy of the input state from this input handler
   * @returns
   */
  getInputState(): InputState {
    const state = new InputState();
    state.buttonsDown = this.buttonsDown;
    state.buttonsReleased = this.buttonsReleased;
    return state;
  }

  isTouchEnabled() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  keydown(e: KeyboardEvent) {
    if (e.key == 'ArrowRight') {
      this.buttonsDown = this.buttonsDown | UserAction.Right;
      e.preventDefault();
    }

    if (e.key == 'ArrowLeft') {
      this.buttonsDown = this.buttonsDown | UserAction.Left;
      e.preventDefault();
    }

    if (e.key == 'ArrowUp') {
      this.buttonsDown = this.buttonsDown | UserAction.Up;
      e.preventDefault();
    }

    if (e.key == 'ArrowDown') {
      this.buttonsDown = this.buttonsDown | UserAction.Down;
      e.preventDefault();
    }

    if (e.key == ' ') {
      this.buttonsDown = this.buttonsDown | UserAction.A;
      e.preventDefault();
    }

    if (e.key == 'b') {
      this.buttonsDown = this.buttonsDown | UserAction.B;
      e.preventDefault();
    }

    if (e.key == 'Enter') {
      this.buttonsDown = this.buttonsDown | UserAction.Start;
      e.preventDefault();
    }
  }

  keyup(e: KeyboardEvent) {
    if (e.key == 'ArrowRight') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Right;
      this.buttonsReleased = this.buttonsReleased | UserAction.Right;
      e.preventDefault();
    }

    if (e.key == 'ArrowLeft') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Left;
      this.buttonsReleased = this.buttonsReleased | UserAction.Left;
      e.preventDefault();
    }

    if (e.key == 'ArrowUp') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Up;
      this.buttonsReleased = this.buttonsReleased | UserAction.Up;
      e.preventDefault();
    }

    if (e.key == 'ArrowDown') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Down;
      this.buttonsReleased = this.buttonsReleased | UserAction.Down;
      e.preventDefault();
    }

    if (e.key == ' ') {
      this.buttonsDown = this.buttonsDown & ~UserAction.A;
      this.buttonsReleased = this.buttonsReleased | UserAction.A;
      e.preventDefault();
    }

    if (e.key == 'b') {
      this.buttonsDown = this.buttonsDown & ~UserAction.B;
      this.buttonsReleased = this.buttonsReleased | UserAction.B;
      e.preventDefault();
    }

    if (e.key == 'Enter') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Start;
      this.buttonsReleased = this.buttonsReleased | UserAction.Start;
      e.preventDefault();
    }
  }

  preUpdate(dt: number) {
    this.pollGamePad(dt);

    // Always call `navigator.getGamepads()` inside of
    // the game loop, not outside.
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // Disregard empty slots.
      if (!gamepad) {
        continue;
      }

      this._gamepad = gamepad;
    }
  }

  postUpdate(dt: number) {
    // reset press actions
    this.buttonsReleased = UserAction.None;
  }

  connectGamepad(e: GamepadEvent): void {
    console.log('✅ 🎮 A gamepad connected:', e.gamepad);
    this._gamepad = e.gamepad;
  }

  disconnectGamepad(e: GamepadEvent): void {
    console.debug('Gamepad disconnected', e.gamepad);
    this._gamepad = null;
  }

  loadMapping() {
    const inputMappingString = window.localStorage.getItem('inputMapping');
    if (inputMappingString) {
      this.inputMappings = JSON.parse(inputMappingString);
      console.debug('loading input map...');
      /*
      console.debug('  up       = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Up]);
      console.debug('  down     = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Down]);
      console.debug('  right    = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Right]);
      console.debug('  left     = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Left]);
      console.debug('  start    = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Start]);
      console.debug('  A        = ' + this.inputMappings.keyboardMapping[this.mappingIndex.A]);
      console.debug('  B        = ' + this.inputMappings.keyboardMapping[this.mappingIndex.B]);
      */
    } else {
      this.inputMappings = {
        gamePadMapping: new Map<string, GamepadInteraction[]>(),
      };
    }
  }

  private gamepadPolling: number = 0;
  private pollGamePad(dt: number): void {
    this.gamepadPolling += dt;

    if (this.gamepadPolling > 1500) {
      this._hasGamePad = navigator.getGamepads()[0] != null;

      if (this._hasGamePad && !this._gamepad) {
        this.connectGamepad(
          new GamepadEvent('gamepadConnect', {
            gamepad: navigator.getGamepads()[0],
          })
        );
      } else if (!this._hasGamePad && this._gamepad) {
        this.disconnectGamepad(
          new GamepadEvent('gamepadDisconnect', { gamepad: this._gamepad })
        );
      }
      this.gamepadPolling = 0;
    }
  }

  resetInput() {
    this.buttonsDown = UserAction.None;
    this.buttonsReleased = UserAction.None;

    this._hasGamePad = 'getGamepads' in navigator;
    if (this._hasGamePad) {
      console.debug(' gamepad supported ', navigator.getGamepads());

      window.removeEventListener('gamepadconnected', this.boundConnectGamepad);
      window.removeEventListener(
        'gamepaddisconnected',
        this.boundDisconnectGamepad
      );

      window.addEventListener('gamepadconnected', this.boundConnectGamepad);
      window.addEventListener(
        'gamepaddisconnected',
        this.boundDisconnectGamepad
      );
    } else {
      console.warn('gamepad not supported!');
    }
  }

  closeLevel(): void {
    this.resetInput();
  }
}
