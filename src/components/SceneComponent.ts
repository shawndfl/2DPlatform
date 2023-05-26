import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { UserAction } from '../core/UserAction';
import { ILevelData } from '../environment/ILevelData';
import { Texture } from '../graphics/Texture';
import { DialogMenu } from '../menus/DialogMenu';
import { GroundManager } from '../systems/GroundManager';
import { Component } from './Component';
import { PlayerController } from './PlayerController';

/**
 * This is a base class for a scene
 */
export abstract class SceneComponent extends Component {
  /**
   * This manages the ground tiles for the level
   */
  abstract get ground(): GroundManager;

  /**
   * The player sprite controller
   */
  abstract get player(): PlayerController;

  /**
   * A way of displaying dialog on the scene
   */
  abstract get dialog(): DialogMenu;

  /**
   * constructor
   * @param eng
   */
  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Initialize the scene
   * @param options
   */
  async initialize(options: { level: ILevelData }) {}

  /**
   * Handles user input. The logic goes through a chain of commands
   *    1) Main menu
   *    2) pause menu
   *    3) battle menu
   *    4) dialog menu
   *    5) player in the environment
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  abstract handleUserAction(action: InputState): boolean;

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number) {}

  /**
   * When the window is resized
   */
  resize(width: number, height: number) {}

  /**
   * Dispose the scene
   */
  dispose() {}
}
