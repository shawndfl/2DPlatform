import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { EmptyTileId } from '../core/EmptyTileId';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';
import { TileFactory } from '../systems/TileFactory';
import { Random } from '../utilities/Random';
import { Timer } from '../utilities/Timer';
import { HillGenerator } from './HillGenerator';
import { LevelConstructionParams } from './LevelConstructionParams';
import { LevelGeneratorState } from './LevelGeneratorState';

/**
 * This class is used to generate levels
 */
export class LevelGenerator extends Component {
  private _levelState: LevelGeneratorState;
  private _creationParams: LevelConstructionParams;
  private _random: Random;
  private _hillGenerator: HillGenerator;
  protected _tiles: TileComponent[][][];

  /**
   * Get the state of the level generation
   */
  get levelState(): LevelGeneratorState {
    return this._levelState;
  }

  get creationParams(): LevelConstructionParams {
    return this._creationParams;
  }

  /**
   * Get the next random number
   */
  get ran() {
    return this._random.rand();
  }

  constructor(eng: Engine, protected _tileFactory: TileFactory) {
    super(eng);
    this._tiles = [[[]]];
    this._hillGenerator = new HillGenerator(eng);
  }

  /**
   * Simple level generator
   * @param opt
   * @returns
   */
  Generate(param: LevelConstructionParams): TileComponent[][][] {
    this._creationParams = param;
    this._random = new Random(this._creationParams.seed);

    // allocate empty scene
    this.createEmpty();

    // position the character
    let characterPos = param.playerPos;
    if (!characterPos) {
      characterPos = this.getRandomPoint();
    }
    // this will just set the player's position
    this._tileFactory.createStaticTile('player|', characterPos.x, characterPos.y, 1);

    const timer = new Timer();
    console.debug('creation params', param);
    const tiles = this._tiles;

    // set up your component generators
    this._hillGenerator.initialize(this);

    // generate ground
    this.generateGround();

    // create a hill
    this._hillGenerator.generate();

    const npcPos = this.getRandomPoint(new vec2(1, 1), new vec2(param.width - 2, param.length - 2));
    const npc = this._tileFactory.createStaticTile('npc|poo', npcPos.x, npcPos.y, 1);
    this._tiles[1][npcPos.y][npcPos.x] = npc;
    console.debug('poos position ' + npcPos.toString());

    this.generateLevel1();

    console.debug('built level in ' + timer.elapsed.toFixed(2) + 'ms');
    return tiles;
  }

  /**
   * Create an empty world
   */
  createEmpty() {
    const param = this._creationParams;
    this._tiles = [[[]]];
    const tiles = this._tiles;

    // clear all sprites
    this._tileFactory.clearSpriteBatch();

    // clear all tiles
    for (let k = 0; k < param.height; k++) {
      tiles.push([]);
      for (let j = 0; j < param.length; j++) {
        // i is the rows that run from top left to bottom right
        tiles[k].push([]);

        for (let i = 0; i < param.width; i++) {
          tiles[k][j].push(this._tileFactory.empty);
        }
      }
    }
  }

  /**
   * Check if there is space at the location and size
   * @param opt
   * @returns
   */
  HasSpace(opt: {
    startI: number;
    startJ: number;
    startK: number;
    width: number;
    length: number;
    height: number;
  }): boolean {
    const tiles = this._tiles;
    for (let k = opt.startK; k < opt.startK + opt.height && k < tiles.length; k++) {
      // check range
      if (k >= tiles.length || k < 0) {
        return false;
      }
      for (let j = opt.startJ; j < opt.startJ + opt.length; j++) {
        // check range
        if (j >= tiles[k].length || j < 0) {
          return false;
        }
        for (let i = opt.startI; i < opt.startI + opt.width; i++) {
          // check range
          if (i >= tiles[k][j].length || i < 0) {
            return false;
          }

          // finally check if the tile is empty
          if (!tiles[k][j][i].empty) {
            return false;
          }

          // check if there is something below the space we are checking
          if (opt.startK > 0 && k == opt.startK) {
            // if it's empty we don't want to put something there
            if (tiles[k - 1][j][i].empty) {
              return false;
            }

            if (i == 0) {
              console.debug('i == 0 ');
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * Create ground
   */
  generateGround() {
    const tiles = this._tiles;
    const groundIndex = 0;

    const param = this._creationParams;

    // when creating the ground add padding so we can add in portals
    for (let j = 1; j < param.length - 1; j++) {
      for (let i = 1; i < param.width - 1; i++) {
        const option = Math.floor(this.ran * 50);

        // get the type and sprite id
        let tileTypeAndSprite = this.getFloorTile();
        const newTile = this._tileFactory.createStaticTile(tileTypeAndSprite, i, j, groundIndex);
        // add the new tile
        tiles[groundIndex][j][i] = newTile;
      }
    }

    {
      // create a portal
      const portalLoc = this.getRandomPoint(new vec2(param.width - 1, 1), new vec2(0, param.length - 2));
      const i = portalLoc.x;
      const j = portalLoc.y;

      // add portal
      const tilePortalSprite = this.getPortalTile();

      const tilePortal1 = this._tileFactory.createStaticTile(tilePortalSprite, i, j + 0, groundIndex);
      const tilePortal2 = this._tileFactory.createStaticTile(tilePortalSprite, i, j + 1, groundIndex);
      // add the new tile
      tiles[groundIndex][j + 0][i] = tilePortal1;
      tiles[groundIndex][j + 1][i] = tilePortal2;
    }
  }

  /**
   * Sets a tile to a given location and type type
   * @param tileType string in the format of <type|sprite|...>
   * @param i lower left
   * @param j lower right
   * @param k height
   */
  createTile(tileType: string, i: number, j: number, k: number) {
    const tile = this._tileFactory.createStaticTile(tileType, i, j, k);
    this._tiles[k][j][i] = tile;
  }

  /**
   * Create stuff above the ground
   */
  generateLevel1() {
    const tiles = this._tiles;
    const baseLevel = 1;

    const param = this._creationParams;

    for (let j = 0; j < param.length; j += 5) {
      for (let i = 0; i < param.width; i += 5) {
        const option = Math.floor(this.ran * 100);

        let tileTypeAndSprite = EmptyTileId;
        if (option > 0 && option < 50) {
          if (this.HasSpace({ startI: i - 5, startJ: j - 5, startK: 1, width: 10, height: 2, length: 10 })) {
            tileTypeAndSprite = this.getCollision();
          }
        } else if (option >= 50) {
          if (this.HasSpace({ startI: i - 5, startJ: j - 5, startK: 1, width: 10, height: 2, length: 10 })) {
            tileTypeAndSprite = this.getCoin();
          }
        }
        const newTile = this._tileFactory.createStaticTile(tileTypeAndSprite, i, j, baseLevel);
        // add the new tile
        if (tiles[baseLevel][j][i].empty) {
          tiles[baseLevel][j][i] = newTile;
        }
      }
    }
  }

  /**
   * Get a random position for the character
   * @returns
   */
  getRandomPoint(offset?: vec2, scale?: vec2): vec2 {
    const pos = new vec2();
    const p = this._creationParams;
    if (!offset) {
      offset = new vec2(0, 0);
    }
    if (!scale) {
      scale = new vec2(p.width, p.length);
    }
    pos.x = Math.floor(this.ran * scale.x + offset.x);
    pos.y = Math.floor(this.ran * scale.y + offset.y);

    return pos;
  }

  /**
   * get a floor tile
   * @returns
   */
  getFloorTile() {
    const option = Math.floor(this.ran * 50);
    if (option == 2) {
      return 'open|block.grass.dirt';
    } else if (option == 3) {
      return 'open|block.grass.patch';
    } else {
      return 'open|block.grass';
    }
  }

  getSlopTileLeft() {
    return 'slop|slop.left';
  }
  getFloorTileEdgeLeft() {
    return 'open|block.grass.edge.left';
  }
  getFloorTileEdgeRight() {
    return 'open|block.grass.edge.right';
  }
  getFloorTileEdgeBoth() {
    return 'open|block.grass.edge.both';
  }

  getPortalTile() {
    const option = Math.floor(this.ran * 50);
    if (option == 2) {
      return 'portal|block.grass.dirt|town1';
    } else if (option == 3) {
      return 'portal|block.grass.patch|town1';
    } else {
      return 'portal|block.grass|town1';
    }
  }

  getCoin() {
    return 'gold|coin.1';
  }
  getCollision() {
    return 'collide|tree';
  }
}
