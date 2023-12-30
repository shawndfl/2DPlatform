import { Texture } from '../../graphics/Texture';
import { AssetManager, BuiltInTextureAssets } from '../../systems/AssetManager';
import { PlatformEngine } from '../PlatformEngine';
import { TileData } from '../../graphics/ISpriteData';

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
    this.textures.set(TextureAssets.edge, {
      texture: await new Texture(this.gl).loadImage(edge),
      data: edgeData,
    });

    this.textures.set(TextureAssets.zero, {
      texture: await new Texture(this.gl).loadImage(zero),
      data: zeroData,
    });

    this.textures.set(TextureAssets.level1Tile, {
      texture: await new Texture(this.gl).loadImage(level1Tile),
      data: level1TileData,
    });

    this.textures.set(TextureAssets.enemies, {
      texture: await new Texture(this.gl).loadImage(enemies),
      data: enemiesData,
    });

    // this must be last
    await super.initialize();
  }
}
