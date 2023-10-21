import { Engine } from "../core/Engine";
import { ISceneManager } from "../interfaces/ISceneManager";
import { AssetManager } from "../systems/AssetManager";
import { GameEditor } from "./editor/GameEditor";
import { GameAssetManager } from "./system/GameAssetManager";
import { SceneManager } from "./system/SceneManager";

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly _sceneManager: SceneManager;
  private editor: GameEditor;

  get sceneManager(): ISceneManager {
    return this._sceneManager;
  }

  constructor() {
    super();
    this._sceneManager = new SceneManager(this);
  }

  createAssetManager(): AssetManager {
    return new GameAssetManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {
    await super.initialize(root);

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('editor')) {
      const editor = new GameEditor(this);
      await editor.initialize(document.getElementById('rootContainer'));

    }
  }

  update(dt: number): void {
    super.update(dt);
    if (this.editor) {
      this.editor.update(dt);
    }
  }
}
