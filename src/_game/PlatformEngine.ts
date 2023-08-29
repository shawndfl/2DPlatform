import { Engine } from "../core/Engine";
import { ISceneManager } from "../interfaces/ISceneManager";
import { SceneManager } from "./system/SceneManager";

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly sceneManager: SceneManager;

  get SceneManager(): ISceneManager {
    return this.sceneManager;
  }

  constructor() {
    super();
    this.sceneManager = new SceneManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {
    await super.initialize(root);

    this.sceneManager.initialize();
  }
}
