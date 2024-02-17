import { Engine } from '../core/Engine';
import { InputState } from '../core/InputState';
import { AssetManager } from '../systems/AssetManager';
import { SceneManager } from '../systems/SceneManager';
import { PlayerController } from './components/PlayerController';
import { LevelData } from './data/ILevelData';
import { GameEditor } from './editor/GameEditor';
import { SceneFactory } from './scenes/SceneFactory';
import { BulletManager } from './system/BulletManager';
import { GameAssetManager } from './system/GameAssetManager';

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly player: PlayerController;
  readonly bullets: BulletManager;

  constructor() {
    super();
    this.player = new PlayerController(this);
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
  }

  loadLevel(level: LevelData): void {}

  handleUserAction(state: InputState): boolean {
    return (
      this.dialogManager.handleUserAction(state) ||
      this.player.handleUserAction(state) ||
      this.sceneManager.scene.handleUserAction(state)
    );
  }

  gameUpdate(dt: number): void {
    if (this.sceneManager.sceneReady) {
      this.sceneManager.update(dt);

      this.physicsManager.update(dt);

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
