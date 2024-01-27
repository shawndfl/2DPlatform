import { SceneComponent } from '../components/SceneComponent';
import { ISceneFactory } from '../interfaces/ISceneFactory';
import { Engine } from '../core/Engine';
import { Component } from '../components/Component';

export class SceneManager extends Component {
  private _activeScene: SceneComponent;

  private _nextScene: string;
  private _sceneReady: boolean;

  get sceneReady(): boolean {
    return this._sceneReady;
  }
  get scene(): SceneComponent {
    return this._activeScene;
  }

  constructor(eng: Engine, private _sceneFactory: ISceneFactory) {
    super(eng);
  }

  async initialize() {
    //NOP
  }

  /**
   * This is used to change the scene on the next update.
   * @param scene
   */
  setNextScene(scene: string): void {
    this._nextScene = scene;
  }

  /**
   * Switch to a different scene. This should only be called from platform engine.
   * everything else should use setNextScene()
   * @param newScene
   */
  async changeScene(type: string): Promise<boolean> {
    this._sceneReady = false;
    this._nextScene = '';

    const scene = this._sceneFactory.createScene(type);
    if (!scene) {
      console.error('failed to change scene to ' + type);
      return false;
    }

    if (this._activeScene) {
      this._activeScene.dispose();
    }

    this._activeScene = scene;

    await this._activeScene.initialize();

    this._sceneReady = true;
  }

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number) {
    if (this._nextScene) {
      this.changeScene(this._nextScene);
    }

    if (this._sceneReady) {
      this._activeScene.update(dt);
    }
  }

  postUpdate(dt: number): void {
    this._activeScene.postUpdate(dt);
  }

  /**
   * When the window is resized
   */
  resize(width: number, height: number) {
    this._activeScene.resize(width, height);
  }
}
