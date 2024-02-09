import { AssetManager, BuiltInTextureAssets } from '../../systems/AssetManager';
import { PlatformEngine } from '../PlatformEngine';

import edge from '../assets/common/edge.png';
import edgeData from '../assets/common/edge.json';
import hud from '../assets/ui/hud.png';
import hudData from '../assets/ui/hud.json';

//import zero from '../assets/common/zero.png';
//import zeroData from '../assets/common/zero.json';
import enemies from '../assets/common/enemies.png';
import enemiesData from '../assets/common/enemies.json';

export class TextureAssets extends BuiltInTextureAssets {
  static readonly edge = 'edge';
  static readonly enemies = 'enemies';
  //static readonly zero = 'zero';
  static readonly hud = 'hud';
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
    promises.push(this.loadTexture(TextureAssets.hud, hud, hudData));

    //promises.push(this.loadTexture(TextureAssets.zero, zero, zeroData));
    promises.push(
      this.loadTexture(TextureAssets.enemies, enemies, enemiesData)
    );

    // this must be last
    promises.push(super.initialize());

    await Promise.all(promises);
  }
}
