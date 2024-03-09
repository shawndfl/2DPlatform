import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import { EnemyController } from '../components/EnemyController';
import { GameComponent } from '../components/GameComponent';
import { GameAssetManager, TextureAssets } from './GameAssetManager';

/**
 * Manages enemies for a level
 */
export class EnemyManager extends GameComponent {
  /** list of active enemies */
  private _active: Map<string, EnemyController> = new Map<
    string,
    EnemyController
  >();

  private _spriteCollection: SpriteInstanceCollection =
    new SpriteInstanceCollection(this.eng);

  public get spriteCollection(): SpriteInstanceCollection {
    return this._spriteCollection;
  }

  /**
   * Initialize texture assets for enemies
   */
  async initialize(): Promise<void> {
    const textureAsset = this.eng.assetManager.getTexture(
      TextureAssets.enemies
    );
    this._spriteCollection.initialize(textureAsset.texture, textureAsset.data);
  }

  reset(): void {
    this._active.forEach((e) => e.dispose());
  }

  addEnemy(enemy: EnemyController): void {
    this._active.set(enemy.id, enemy);
  }

  update(dt: number): void {
    this._active.forEach((e) => e.update(dt));
    this.spriteCollection.update(dt);
  }
}
