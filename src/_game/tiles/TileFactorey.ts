import { Component } from '../../components/Component';
import { Engine } from '../../core/Engine';
import { EnemyController } from '../components/EnemyController';
import { GroundManager } from '../system/GroundManager';
import { EmptyTile } from './EmptyTile';
import { SolidTile } from './SolidTile';
import { ITileCreationArgs, TileComponent } from './TileComponent';

export interface ITileTypeData {
  tile: string;
  tileClass: string;
  spriteId: string;
  options: string[];
  typeIndex: number; /// The index of the type
}

export class TileFactory extends Component {
  /**
   * a readonly empty tile
   */
  readonly empty: EmptyTile;

  /**
   * The id for empty
   */
  readonly emptyId = 'empty';

  constructor(protected gm: GroundManager) {
    super(gm.eng);
    this.empty = new EmptyTile(this.gm);
  }

  /**
   * Create an ID for the tile from the initial
   * @param i
   * @param j
   * @param k
   * @returns
   */
  static createStaticID(i: number, j: number, k: number): string {
    return 'tile.' + (i ?? '_') + '.' + (j ?? '_') + '.' + (k ?? '_');
  }

  /**
   * Parses the tileType. This is an encoded string that is in the format of
   * <tile type>|<sprint id>|[option1,options2,...]
   * @param Tile
   * @returns
   */
  static parseTile(tile: string): ITileTypeData {
    if (tile == '---') {
      tile = 'empty|empty|';
    }

    const TileData: ITileTypeData = {
      tile,
      tileClass: '',
      spriteId: '',
      options: null,
      typeIndex: -1,
    };

    const typeSpriteParams = tile.split('|');

    if (typeSpriteParams.length != 3) {
      return null;
    }

    TileData.tileClass = typeSpriteParams[0];
    TileData.spriteId = typeSpriteParams[1];
    TileData.options = typeSpriteParams[2].split(',');

    return TileData;
  }

  /**
   * Create static tiles
   * @param type
   * @param i
   * @param j
   * @param k
   * @returns
   */
  create(tile: string, i: number, j: number): TileComponent {
    if (!tile || tile == '---' || tile == 'empty') {
      return new EmptyTile(this.gm, i, j);
    }

    const data = TileFactory.parseTile(tile);
    if (!data) {
      console.error(
        "invalid tile: '" +
          tile +
          "' @ (" +
          i +
          ', ' +
          j +
          ')' +
          ' Format should be <tile type>|<sprint id>|[option1,options2,...] '
      );
      return new EmptyTile(this.gm, i, j);
    }
    const tileType = data.tileClass;

    const args: ITileCreationArgs = {
      i,
      j,
      tileClass: data.tileClass,
      spriteName: data.spriteId,
      options: data.options,
    };

    if (tileType == 'solid') {
      return new SolidTile(this.gm, args);
    } else if (tileType == 'empty') {
      return new EmptyTile(this.gm, i, j);
    } else if (tileType == 'enemy.1') {
      return new EnemyController(this.gm.eng, args);
    } else {
      console.error(
        "Unknown tile type '" + tile + "' @ (" + i + ', ' + j + ')'
      );
      return new EmptyTile(this.gm, i, j);
    }
  }
}
