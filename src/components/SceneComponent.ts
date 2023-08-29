
import { InputState } from "../core/InputHandler";
import { Component } from "../core/Component";
import { PlayerController } from "../_game/components/PlayerController";
import { ILevelData } from "../_game/data/ILevelData";
import { Engine } from "../core/Engine";

/**
 * This is a base class for a scene
 */
export abstract class SceneComponent extends Component {
  
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
  async initialize(options: { level: ILevelData }) { }

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
  handleUserAction(action: InputState): boolean {
    return false;
  }

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number): void { }

  /**
   * Show scene is called when a SceneManager changes to a new scene.
   */
  async ShowScene(): Promise<void> { }

  /**
   * Hide scene is called when a SceneManager changes to a new scene.
   */
  HideScene(): void { }

  /**
   * When the window is resized
   */
  resize(width: number, height: number): void { }

  /**
   * Dispose the scene
   */
  dispose(): void { }
}
