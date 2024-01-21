import { AssetManager, BuiltInTextureAssets } from '../../systems/AssetManager';
import { PlatformEngine } from '../PlatformEngine';

import edge from '../assets/edge.png';
import edgeData from '../assets/edge.json';
import zero from '../assets/zero.png';
import zeroData from '../assets/zero.json';
import enemies from '../assets/enemies.png';
import enemiesData from '../assets/enemies.json';
import level1Tile from '../assets/Level1Tiles.png';
import level1TileData from '../assets/Level1Tiles.json';

export class TextureAssets extends BuiltInTextureAssets {
  static readonly edge = 'edge';
  static readonly enemies = 'enemies';
  static readonly zero = 'zero';
  static readonly level1Tile = 'level1Tile';
}

/**
 * Manages game asses for this platform game
 */
export class GameAssetManager extends AssetManager {
  constructor(eng: PlatformEngine) {
    super(eng);
  }

  async initialize() {
    const promises = [];
    promises.push(this.loadTexture(TextureAssets.edge, edge, edgeData));
    promises.push(this.loadTexture(TextureAssets.zero, zero, zeroData));
    promises.push(
      this.loadTexture(TextureAssets.enemies, enemies, enemiesData)
    );
    promises.push(
      this.loadTexture(TextureAssets.level1Tile, level1Tile, level1TileData)
    );

    // this must be last
    promises.push(super.initialize());

    await Promise.all(promises);
  }
}
