import { Engine } from '../core/Engine';
import { InputState } from '../core/InputState';
import { AssetManager } from '../systems/AssetManager';
import { PlayerController } from './components/PlayerController';
import { TestAnimationController } from './components/TestAnimationController';
import { GameEditor } from './editor/GameEditor';
import { BulletManager } from './system/BulletManager';
import { GameAssetManager } from './system/GameAssetManager';
import { GameSceneManager } from './system/GameSceneManager';
import { GroundManager } from './system/GroundManager';

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly sceneManager: GameSceneManager;
  readonly editor: GameEditor;
  readonly player: PlayerController;
  readonly testAnimation: TestAnimationController;
  readonly groundManager: GroundManager;
  readonly bullets: BulletManager;
  readonly urlParams: URLSearchParams;

  private editorMode: boolean;
  private animationMode: boolean;

  constructor() {
    super();
    const queryString = window.location.search;
    this.urlParams = new URLSearchParams(queryString);
    this.sceneManager = new GameSceneManager(this);
    this.groundManager = new GroundManager(this);
    this.player = new PlayerController(this);
    this.testAnimation = new TestAnimationController(this);
    this.editor = new GameEditor(this);
    this.bullets = new BulletManager(this);
  }

  createAssetManager(): AssetManager {
    return new GameAssetManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {
    await super.initialize(root);

    this.groundManager.initialize();
    if (this.urlParams.get('animation')) {
      this.testAnimation.initialize();
      this.animationMode = true;
    } else {
      this.player.initialize();
    }

    await this.bullets.initialize();

    // load the first scene
    this.sceneManager.changeScene('level.1.0');

    // used for isolated feature debugger
    //this.sceneManager.changeScene("levelRenderTest");
    if (this.urlParams.get('editor')) {
      await this.editor.initialize(document.getElementById('rootContainer'));
      this.editorMode = true;
    }
  }

  handleUserAction(state: InputState): boolean {
    if (this.animationMode) {
      return this.testAnimation.handleUserAction(state);
    } else {
      return (
        this.dialogManager.handleUserAction(state) ||
        this.player.handleUserAction(state) ||
        this.sceneManager.scene.handleUserAction(state)
      );
    }
  }

  gameUpdate(dt: number): void {
    this.sceneManager.update(dt);
    if (this.editorMode) {
      this.editor.update(dt);
    }
    if (this.animationMode) {
      this.testAnimation.update(dt);
    } else {
      this.player.update(dt);
    }

    this.physicsManager.update(dt);
    this.groundManager.update(dt);
    this.bullets.update(dt);
    this.particleManager.update(dt);
    this.dialogManager.update(dt);
    this.textManager.update(dt);
    this.annotationManager.update(dt);
  }

  // Used for isolated feature debugger
  /*
  update(dt: number): void {
    this.sceneManager.update(dt);
  }
  */
}
