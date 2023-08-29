import { Component } from "../../core/Component";
import Level1 from "../assets/levels/level1.json";
import { SceneComponent } from "../../components/SceneComponent";
import { SceneFactory } from "../scenes/SceneFactory";
import { ISceneManager } from "../../interfaces/ISceneManager";
import { Engine } from "../../core/Engine";

export class SceneManager extends Component implements ISceneManager {
  private _activeScene: SceneComponent;
  private _lastScene: SceneComponent;
  private _sceneFactory: SceneFactory;

  get scene(): SceneComponent {
    return this._activeScene;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sceneFactory = new SceneFactory(eng);
  }

  async initialize() {
    this.changeScene("main.menu");
    await this.scene.initialize({ level: Level1 });
  }

  /**
   * Switch to a different scene.
   * @param newScene
   */
  async changeScene(type: string): Promise<boolean> {
    const newScene = this._sceneFactory.createScene(type);
    if (!newScene) {
      console.error("failed to change scene to " + type);
      return false;
    }

    if (this._activeScene) {
      this._activeScene.HideScene();
    }

    this._lastScene = this._activeScene;
    this._activeScene = newScene;

    await this._activeScene.ShowScene();
  }

  /**
   * Restore last scene
   * @returns
   */
  restoreLastScene() {
    if (!this._lastScene) {
      return;
    }
    const newScene = this._lastScene;

    if (this._activeScene) {
      this._activeScene.HideScene();
    }

    this._lastScene = null;
    this._activeScene = newScene;

    this._activeScene.ShowScene();
  }

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number) {
    this._activeScene.update(dt);
  }

  /**
   * When the window is resized
   */
  resize(width: number, height: number) {}

  /**
   * Dispose the scene
   */
  dispose() {}
}
