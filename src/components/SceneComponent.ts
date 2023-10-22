
import { InputState } from "../core/InputHandler";
import { Component } from "../components/Component";
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
   * Handles user input. The logic goes through a chain of commands
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
  abstract update(dt: number): void;

  /**
   * Show scene is called when a SceneManager changes to a new scene.
   */
  abstract initialize(): void;

  /**
   * When the window is resized
   */
  resize(width: number, height: number): void { }

  /**
   * Dispose the scene
   */
  dispose(): void { }
}
