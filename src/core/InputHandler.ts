import { Component } from '../components/Component';
import vec2 from '../math/vec2';
import { Engine } from './Engine';
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

  isReleased(btn: UserAction) {
    return (this.buttonsReleased & btn) > 0;
  }

  isDown(btn: UserAction) {
    return (this.buttonsDown & btn) > 0;
  }
}

export interface InputMappings {
  /**
   * Mapping for the keyboard
   */
  keyboardMapping: string[];

  /**
   * Mappint for the game pads
   */
  gamePadMapping: Map<string, number[]>
}

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
   * Are we calibrating the logical buttons.
   */
  isCalibrating: boolean;

  /**
   * This flag will increase show the next prompt after a button is mapped.
   */
  calibrationNextPrompt: boolean;

  /**
   * What logical button index are we calibrating.
   */
  activeButtonIndex: number;

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

  private boundConnectGamepad: (e: GamepadEvent) => void;
  private boundDisconnectGamepad: (e: GamepadEvent) => void;

  constructor(eng: Engine) {
    super(eng);

    this.mappingIndex = { Start: 0, Select: 1, A: 2, B: 3, X: 4, Y: 5, Up: 6, Down: 7, Right: 8, Left: 9, TriggerR: 10, TriggerL: 11 };


    this.buttonsDown = UserAction.None;
    this.buttonsReleased = UserAction.None;
    this.hasGamePad = 'getGamepads' in navigator;
    console.debug('initializing input:');

    this.touchPoint = [vec2.zero, vec2.zero];
    this.touchCount = 0;
    this.boundConnectGamepad = this.connectGamepad.bind(this);
    this.boundDisconnectGamepad = this.disconnectGamepad.bind(this);

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
        if (!this.isCalibrating) {
          if (e.shiftKey) {
            this.inputDown = [false, true];
          } else {
            this.inputDown = [true, false];
          }
          this.inputReleased = false;
          this.touchPoint[0].x = e.offsetX;
          this.touchPoint[0].y = e.offsetY;
          this.touchCount = 1;
        }
      });
      window.addEventListener('mouseup', (e) => {
        if (!this.isCalibrating) {
          this.inputDown = [false, false];
          this.inputReleased = true;
          this.touchPoint[0].x = e.offsetX;
          this.touchPoint[0].y = e.offsetY;
          this.touchCount = 1;
        }
      });
    } else {
      console.debug(' touch enabled');
      window.addEventListener('touchstart', (e) => {
        if (!this.isCalibrating) {
          if (e.touches.length > 0 && e.touches[0].target === eng.gl.canvas) {
            this.inputDown = [e.touches.item(0) ? true : false, e.touches.item(1) ? true : false];
            this.inputReleased = false;

            const t = e.touches[0].target as HTMLCanvasElement;
            this.touchPoint[0].x = e.touches[0].pageX - t.clientTop;
            this.touchPoint[0].y = e.touches[0].screenY;
            if (e.touches.length > 1) {
              this.touchPoint[1].x = e.touches[1].pageX - t.clientTop;;
              this.touchPoint[1].y = e.touches[1].screenY;
            }
            this.touchCount = e.touches.length;
          }
        }
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

  beginCalibration() {
    console.info('Starting new input calibration...');
    this.isCalibrating = true;
    this.activeButtonIndex = 0;
    this.calibrationNextPrompt = true;
  }

  isTouchEnabled() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  keydown(e: KeyboardEvent) {
    if (!this.isCalibrating) {
      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Right]) {
        this.buttonsDown = this.buttonsDown | UserAction.Right;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Left]) {
        this.buttonsDown = this.buttonsDown | UserAction.Left;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Up]) {
        this.buttonsDown = this.buttonsDown | UserAction.Up;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Down]) {
        this.buttonsDown = this.buttonsDown | UserAction.Down;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.A]) {
        this.buttonsDown = this.buttonsDown | UserAction.A;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.B]) {
        this.buttonsDown = this.buttonsDown | UserAction.B;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.X]) {
        this.buttonsDown = this.buttonsDown | UserAction.X;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Y]) {
        this.buttonsDown = this.buttonsDown | UserAction.Y;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.TriggerR]) {
        this.buttonsDown = this.buttonsDown | UserAction.TriggerR;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.TriggerL]) {
        this.buttonsDown = this.buttonsDown | UserAction.TriggerL;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Start]) {
        this.buttonsDown = this.buttonsDown | UserAction.Start;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Select]) {
        this.buttonsDown = this.buttonsDown | UserAction.Select;
      }
    }
  }

  keyup(e: KeyboardEvent) {

    if (this.isCalibrating) {
      this.inputMappings.keyboardMapping[this.activeButtonIndex] = e.key;
      console.info('  Mapping: ', e.key);
      this.activeButtonIndex++;
      this.calibrationNextPrompt = true;

      // are we done calibrating
      if (this.activeButtonIndex >= Object.keys(this.mappingIndex).length) {
        this.doneCalibrating();
      }
    } else {

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Right]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Right;
        this.buttonsReleased = this.buttonsReleased | UserAction.Right;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Left]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Left;
        this.buttonsReleased = this.buttonsReleased | UserAction.Left;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Up]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Up;
        this.buttonsReleased = this.buttonsReleased | UserAction.Up;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Down]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Down;
        this.buttonsReleased = this.buttonsReleased | UserAction.Down;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.A]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.A;
        this.buttonsReleased = this.buttonsReleased | UserAction.A;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.B]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.B;
        this.buttonsReleased = this.buttonsReleased | UserAction.B;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.X]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.X;
        this.buttonsReleased = this.buttonsReleased | UserAction.X;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Y]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Y;
        this.buttonsReleased = this.buttonsReleased | UserAction.Y;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.TriggerR]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.TriggerR;
        this.buttonsReleased = this.buttonsReleased | UserAction.TriggerR;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.TriggerL]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.TriggerL;
        this.buttonsReleased = this.buttonsReleased | UserAction.TriggerL;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Start]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Start;
        this.buttonsReleased = this.buttonsReleased | UserAction.Start;
      }

      if (e.key == this.inputMappings.keyboardMapping[this.mappingIndex.Select]) {
        this.buttonsDown = this.buttonsDown & ~UserAction.Select;
        this.buttonsReleased = this.buttonsReleased | UserAction.Select;
      }
    }
  }

  preUpdate(dt: number) {

    this.pollGamePad(dt);

    if (this.isCalibrating) {
      if (this.calibrationNextPrompt) {
        console.info('Hit the ' + Array.from(Object.keys(this.mappingIndex)).find((key, index) =>
          index == this.activeButtonIndex
        ))
        this.calibrationNextPrompt = false;
      }
    }

    // Always call `navigator.getGamepads()` inside of
    // the game loop, not outside.
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // Disregard empty slots.
      if (!gamepad) {
        continue;
      }

      //TODO capture state from game pads
      gamepad.buttons.forEach((btn) => {
        btn.pressed
      })
    }
  }

  postUpdate(dt: number) {
    // reset press actions
    this.buttonsReleased = UserAction.None;
    this.inputReleased = false;
  }

  connectGamepad(e: GamepadEvent): void {
    console.log('✅ 🎮 A gamepad was connected:', e.gamepad);
  }

  disconnectGamepad(e: GamepadEvent): void {
    console.debug('Gamepad disconnected', e.gamepad);
  }

  loadMapping() {
    const inputMappingString = window.localStorage.getItem('inputMapping');
    if (inputMappingString) {
      this.inputMappings = JSON.parse(inputMappingString);
      console.debug('loading input map...');
      console.debug('  up       = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Up]);
      console.debug('  down     = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Down]);
      console.debug('  right    = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Right]);
      console.debug('  left     = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Left]);
      console.debug('  start    = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Start]);
      console.debug('  select   = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Select]);
      console.debug('  triggerR = ' + this.inputMappings.keyboardMapping[this.mappingIndex.TriggerR]);
      console.debug('  triggerL = ' + this.inputMappings.keyboardMapping[this.mappingIndex.TriggerL]);
      console.debug('  A        = ' + this.inputMappings.keyboardMapping[this.mappingIndex.A]);
      console.debug('  B        = ' + this.inputMappings.keyboardMapping[this.mappingIndex.B]);
      console.debug('  X        = ' + this.inputMappings.keyboardMapping[this.mappingIndex.X]);
      console.debug('  Y        = ' + this.inputMappings.keyboardMapping[this.mappingIndex.Y]);
    } else {
      this.inputMappings = { keyboardMapping: [], gamePadMapping: new Map<string, number[]>() }
      this.beginCalibration();
    }
  }

  doneCalibrating() {
    window.localStorage.setItem('inputMapping', JSON.stringify(this.inputMappings));
    this.isCalibrating = false;
    this.activeButtonIndex = 0;
    console.debug('done calibrating!!')
  }

  private gamepadPolling: number = 0;
  private pollGamePad(dt: number): void {
    this.gamepadPolling += dt;

    if (this.gamepadPolling > 1500) {
      this.hasGamePad = !!navigator.getGamepads();
      //console.debug(' gamepad supported ', navigator.getGamepads());

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
      window.removeEventListener('gamepaddisconnected', this.boundDisconnectGamepad);

      window.addEventListener('gamepadconnected', this.boundConnectGamepad);
      window.addEventListener('gamepaddisconnected', this.boundDisconnectGamepad);
    } else {
      console.warn('gamepad not supported!');
    }
  }

  closeLevel(): void {
    this.resetInput();
  }
}
