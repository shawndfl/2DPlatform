import { Engine } from '../core/Engine';
import { InputState } from '../core/InputState';
import { AssetManager } from '../systems/AssetManager';
import { SceneManager } from '../systems/SceneManager';
import { PlayerController } from './components/PlayerController';
import { GameEditor } from './editor/GameEditor';
import { SceneFactory } from './scenes/SceneFactory';
import { BulletManager } from './system/BulletManager';
import { GameAssetManager } from './system/GameAssetManager';

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly editor: GameEditor;
  readonly player: PlayerController;
  readonly bullets: BulletManager;
  readonly urlParams: URLSearchParams;

  private editorMode: boolean;
  private animationMode: boolean;

  constructor() {
    super();
    const queryString = window.location.search;
    this.urlParams = new URLSearchParams(queryString);
    this.player = new PlayerController(this);
    this.editor = new GameEditor(this);
    this.bullets = new BulletManager(this);
  }

  createSceneManager(): SceneManager {
    return new SceneManager(this, new SceneFactory(this));
  }

  createAssetManager(): AssetManager {
    return new GameAssetManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {
    await super.initialize(root);

    this.player.initialize();

    await this.bullets.initialize();

    // load the first scene
    await this.sceneManager.changeScene(
      this.urlParams.get('level') ?? 'level.2.0'
    );

    // used for isolated feature debugger
    //this.sceneManager.changeScene("levelRenderTest");
    if (this.urlParams.get('editor')) {
      await this.editor.initialize(document.getElementById('rootContainer'));
      this.editorMode = true;
    }
  }

  handleUserAction(state: InputState): boolean {
    return (
      this.dialogManager.handleUserAction(state) ||
      this.player.handleUserAction(state) ||
      this.sceneManager.scene.handleUserAction(state)
    );
  }

  gameUpdate(dt: number): void {
    this.sceneManager.update(dt);
    if (this.sceneManager.sceneReady) {
      this.physicsManager.update(dt);

      if (this.editorMode) {
        this.editor.update(dt);
      }

      this.backgroundManager.update(dt);
      this.player.update(dt);

      this.bullets.update(dt);
      this.particleManager.update(dt);
      this.dialogManager.update(dt);
      this.textManager.update(dt);
      this.annotationManager.update(dt);

      this.sceneManager.postUpdate(dt);
    }
  }

  // Used for isolated feature debugger
  /*
  update(dt: number): void {
    this.sceneManager.update(dt);
  }
  */
}
