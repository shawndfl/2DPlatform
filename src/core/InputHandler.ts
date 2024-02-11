import { Component } from '../components/Component';
import vec2 from '../math/vec2';
import { Engine } from './Engine';
import { GamepadInteraction, InputMappings } from './InputMappings';
import { InputState } from './InputState';
import { UserAction } from './UserAction';

/**
 * Translates keyboard and gamepad events to game actions
 */
export class InputHandler extends Component {
  hasGamePad: boolean;

  /**
   * Used to map logical buttons to real keyboard or game pad buttons.
   */
  readonly mappingIndex;

  /**
   * Mapping for input
   */
  inputMappings: InputMappings;

  /**
   * Name of the game pad
   */
  gamePadType: string;

  /**
   * logical buttons
   */
  buttonsDown: UserAction;

  /**
   * The buttons that were just released
   */
  buttonsReleased: UserAction;

  /**
   * The first two touch points or mouse left botton and mouse left+shift mouse button
   */
  inputDown: [boolean, boolean];

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

  private _injectState: InputState;
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
    this.inputDown = [false, false];
    this.hasGamePad = 'getGamepads' in navigator;
    console.debug('initializing input:');

    this.touchPoint = [vec2.zero, vec2.zero];
    this.touchCount = 0;
    this.inputMappings = {
      gamePadMapping: new Map<string, GamepadInteraction[]>(),
    };

    window.addEventListener('keydown', (e) => {
      this.keydown(e);
    });
    window.addEventListener('keyup', (e) => {
      console.debug('key up ' + e.key);
      this.keyup(e);
    });

    if (!this.isTouchEnabled()) {
      console.debug(' mouse enabled');
      window.addEventListener('mousedown', (e) => {
        if (!(e.target instanceof HTMLCanvasElement)) {
          return;
        }
        const canvas = e.target as HTMLCanvasElement;
        const xScale = canvas.width / canvas.clientWidth;
        const yScale = canvas.height / canvas.clientHeight;

        if (e.shiftKey) {
          this.inputDown = [false, true];
        } else {
          this.inputDown = [true, false];
        }
        this.inputReleased = false;
        this.touchPoint[0].x = e.offsetX * xScale;
        this.touchPoint[0].y = canvas.height - e.offsetY * yScale;
        this.touchCount = 1;
        e.preventDefault();
      });
      window.addEventListener('mouseup', (e) => {
        if (!(e.target instanceof HTMLCanvasElement)) {
          return;
        }
        const canvas = e.target as HTMLCanvasElement;
        const xScale = canvas.width / canvas.clientWidth;
        const yScale = canvas.height / canvas.clientHeight;

        this.inputDown = [false, false];
        this.inputReleased = true;
        this.touchPoint[0].x = e.offsetX * xScale;
        this.touchPoint[0].y = canvas.height - e.offsetY * yScale;
        this.touchCount = 1;
        e.preventDefault();
      });
    } else {
      console.debug(' touch enabled');
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length == 0) {
          return;
        }
        if (!(e.target instanceof HTMLCanvasElement)) {
          return;
        }
        const canvas = e.target as HTMLCanvasElement;
        const xScale = canvas.width / canvas.clientWidth;
        const yScale = canvas.height / canvas.clientHeight;
        this.inputDown = [
          e.touches.item(0) ? true : false,
          e.touches.item(1) ? true : false,
        ];
        this.inputReleased = false;

        this.touchPoint[0].x =
          (e.touches[0].pageX - canvas.offsetLeft) * xScale;
        this.touchPoint[0].y =
          this.eng.height - (e.touches[0].screenY - canvas.offsetTop) * yScale;
        if (e.touches.length > 1) {
          this.touchPoint[1].x = e.touches[1].pageX * xScale;
          this.touchPoint[1].y =
            this.eng.height - e.touches[1].screenY * yScale;
        }
        this.touchCount = e.touches.length;
        e.preventDefault();
      });
      window.addEventListener('touchend', (e) => {
        this.inputDown = [false, false];
        this.inputReleased = true;
        e.preventDefault();
      });
    }

    this.resetInput();
    this.loadMapping();
  }

  getInputState(): InputState {
    const state = new InputState();
    state.buttonsDown = this.buttonsDown;
    state.buttonsReleased = this.buttonsReleased;
    state.inputReleased = this.inputReleased;
    state.inputDown = this.inputDown;
    state.touchPoint = this.touchPoint;
    return state;
  }

  /**
   * Injects an input state that will be used for the next frame.
   * @param state
   */
  injectSate(state: InputState): void {
    this._injectState = state;
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

    /*
    console.debug(
      'keyDown ' +
        this.buttonsDown +
        ' ' +
        this.getInputState().isDown(UserAction.B)
    );
    */
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
    this.inputReleased = false;

    if (this._injectState) {
      this.buttonsDown = this._injectState.buttonsDown;
      this.buttonsReleased = this._injectState.buttonsReleased;
      this.inputReleased = this._injectState.inputReleased;
      this.inputDown = this._injectState.inputDown;
      this.touchPoint = this._injectState.touchPoint;
    }
    this._injectState = null;
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
      this.hasGamePad = navigator.getGamepads()[0] != null;

      if (this.hasGamePad && !this._gamepad) {
        this.connectGamepad(
          new GamepadEvent('gamepadConnect', {
            gamepad: navigator.getGamepads()[0],
          })
        );
      } else if (!this.hasGamePad && this._gamepad) {
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

    this.hasGamePad = 'getGamepads' in navigator;
    if (this.hasGamePad) {
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
