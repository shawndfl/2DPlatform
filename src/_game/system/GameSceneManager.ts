import { Component } from '../../components/Component';
import { SceneComponent } from '../../components/SceneComponent';
import { SceneFactory } from '../scenes/SceneFactory';
import { ISceneManager } from '../../interfaces/ISceneManager';
import { Engine } from '../../core/Engine';
import { GameComponent } from '../components/GameComponent';
import { PlatformEngine } from '../PlatformEngine';

export class GameSceneManager extends GameComponent implements ISceneManager {
  private _activeScene: SceneComponent;
  private _sceneFactory: SceneFactory;

  get scene(): SceneComponent {
    return this._activeScene;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this._sceneFactory = new SceneFactory(eng);
  }

  async initialize() {
    //NOP
  }

  /**
   * Switch to a different scene.
   * @param newScene
   */
  async changeScene(type: string): Promise<boolean> {
    const scene = this._sceneFactory.createScene(type);
    if (!scene) {
      console.error('failed to change scene to ' + type);
      return false;
    }

    if (this._activeScene) {
      this._activeScene.dispose();
    }

    this._activeScene = scene;

    this._activeScene.initialize();
  }

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number) {
    this._activeScene.update(dt);
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
