import { Engine } from "../core/Engine";
import { InputHandler } from "../core/InputHandler";
import { ISceneManager } from "../interfaces/ISceneManager";
import { SceneManager } from "./system/SceneManager";

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly _sceneManager: SceneManager;

  get sceneManager(): ISceneManager {
    return this._sceneManager;
  }

  constructor() {
    super();
    this._sceneManager = new SceneManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {
    await super.initialize(root);
  }
}
