import { GoldComponents } from '../components/GoldComponent';
import { CollideTileComponent } from '../components/CollideTileComponent';
import { Component } from '../components/Component';
import { EmptyTile } from '../components/EmptyTile';
import { NpcComponent } from '../components/NpcComponent';
import { OpenTileComponent } from '../components/OpenTileComponent';
import { SlopTileComponent } from '../components/SlopTileComponent';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { PortalTileComponent } from '../components/PortalTileComponent';

export class TileFactory extends Component {
  /**
   * a readonly empty tile
   */
  readonly empty: EmptyTile;

  /**
   * The id for empty
   */
  readonly emptyId = 'empty';

  constructor(eng: Engine, protected spriteBatch: SpritBatchController) {
    super(eng);
    this.empty = new EmptyTile(this.eng);
  }

  /**
   * Create an ID for the tile from the initial
   * @param i
   * @param j
   * @param k
   * @returns
   */
  static createStaticID(i: number, j: number, k: number) {
    return 'tile.' + i + '.' + j + '.' + k;
  }

  /**
   * Create static tiles
   * @param type
   * @param i
   * @param j
   * @param k
   * @returns
   */
  createStaticTile(type: string, i: number, j: number, k: number): TileComponent {
    if (!type || type == '---' || type == 'empty') {
      return new EmptyTile(this.eng, i, j, k);
    } else if (type.includes('slop')) {
      return new SlopTileComponent(this.eng, this.spriteBatch, type, i, j, k);
    } else if (type.startsWith('open')) {
      return new OpenTileComponent(this.eng, this.spriteBatch, type, i, j, k);
    } else if (type.startsWith('player')) {
      // the player is already created. Just set his position
      const player = this.eng.scene.player;
      player.setTilePosition(i, j, k);
      return player;
    } else if (type.startsWith('npc')) {
      return new NpcComponent(this.eng, type, i, j, k);
    } else if (type.startsWith('gold')) {
      return new GoldComponents(this.eng, this.spriteBatch, type, i, j, k);
    } else if (type.startsWith('collide')) {
      return new CollideTileComponent(this.eng, this.spriteBatch, type, i, j, k);
    } else if (type.startsWith('portal')) {
      return new PortalTileComponent(this.eng, this.spriteBatch, type, i, j, k);
    } else {
      console.warn(' unknown tile type ' + type + ' @ (' + i + ', ' + j + ', ' + k + ')');
      return new EmptyTile(this.eng, i, j, k);
    }
  }

  /**Clear all sprites */
  clearSpriteBatch() {
    this.spriteBatch.clearAllSprites();
  }
}
