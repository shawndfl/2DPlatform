import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileData from '../assets/isometricTile.json';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { ILevelData } from '../environment/ILevelData';
import { TileComponent } from '../components/TileComponent';
import { TileFactory } from './TileFactory';
import { LevelGenerator } from '../environment/LevelGenerator';
import { LevelConstructionParams } from '../environment/LevelConstructionParams';
import vec2 from '../math/vec2';
import { TouchSurfaceEvent } from '../components/TouchSurfaceEvent';

/**
 * The ground class is the cell environment the player interacts with. Cells are block that
 * that different tile components interact with. Think of it as the world tile components live in.
 * This class is driven by Tile image data and LevelData.
 */
export class GroundManager extends Component {
  /** Used to render all the tiles */
  protected _spriteController: SpritBatchController;
  /** model data for the level */
  protected _levelData: ILevelData;
  /** tile components created from the model data */
  protected _tiles: TileComponent[][][];
  /** used to crate the tiles from the model data */
  protected _tileFactory: TileFactory;
  /** tiles that require an update */
  protected _updateTiles: TileComponent[];

  /** used to generate the levels */
  protected _levelGenerator: LevelGenerator;

  constructor(eng: Engine) {
    super(eng);

    this._spriteController = new SpritBatchController(eng);
    this._tileFactory = new TileFactory(eng, this._spriteController);
  }

  /**
   * Initialize a level
   * @param levelData
   */
  async initialize(levelData: ILevelData) {
    this._levelData = levelData;

    // reset tiles that need updates
    this._updateTiles = [];

    const texture = this.eng.assetManager.tile.texture;
    const data = this.eng.assetManager.tile.data;
    this._spriteController.initialize(texture, data);
    console.debug('sprite list: ', this._spriteController.getSpriteList());

    // generate a level
    this._levelGenerator = new LevelGenerator(this.eng, this._tileFactory);

    // create the initial level
    this.buildLevel({ seed: 605, width: 60, length: 60, height: 7 });
  }

  /**
   * Build an auto generated level
   * @param params
   */
  buildLevel(params: LevelConstructionParams) {
    this._tiles = this._levelGenerator.Generate(params);
  }

  buildBattleScene() {
    const playerPos = this.eng.scene.player.tileIndex;

    const startI = playerPos.x - 5;
    const startJ = playerPos.y - 5;
    const k = playerPos.z - 1;
    const width = 10;
    const length = 10;
    const tiles = this._tiles;

    // create the floor
    const jStart = startJ < 0 ? 0 : startJ;
    for (let j = jStart; j < length + jStart; j++) {
      const iStart = startI < 0 ? 0 : startI;
      for (let i = iStart; i < width + iStart; i++) {
        tiles[k][j][i] = this._tileFactory.createStaticTile('open|block.brick', i, j, k);
      }
    }

    // create the border around the ring
    for (let j = jStart; j < length + jStart; j++) {
      const i = startI;
      tiles[k + 1][j][i] = this._tileFactory.createStaticTile('open|block.brick', i, j, k + 1);
    }

    for (let j = jStart; j < length + jStart; j++) {
      const i = startI + width;
      tiles[k + 1][j][i] = this._tileFactory.createStaticTile('open|block.brick', i, j, k + 1);
    }

    for (let i = startI; i <= width + startI; i++) {
      const j = startJ + length;
      tiles[k + 1][j][i] = this._tileFactory.createStaticTile('open|block.brick', i, j, k + 1);
    }

    for (let i = startI; i <= width + startI; i++) {
      const j = startJ;
      tiles[k + 1][j][i] = this._tileFactory.createStaticTile('open|block.brick', i, j, k + 1);
    }

    return true;
  }

  /**
   * Register a tile for update
   * @param tile
   */
  registerForUpdate(tile: TileComponent) {
    this._updateTiles.push(tile);
  }

  /**
   * Returns true if the cell is empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  isEmpty(i: number, j: number, k: number): boolean {
    return this.getTile(i, j, k).type == 'empty';
  }

  /**
   *
   * @param tileComponent
   * @param moveDirection
   */
  raisePlayerAction(tileComponent: TileComponent) {
    const i = tileComponent.tileIndex.x;
    const j = tileComponent.tileIndex.y;
    const k = tileComponent.tileIndex.z;

    // Check all tiles around this tile component
    this.getTile(i - 1, j + 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 0, j + 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 1, j + 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 1, j + 0, k).onPlayerAction(tileComponent);
    this.getTile(i + 1, j - 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 0, j - 1, k).onPlayerAction(tileComponent);
    this.getTile(i - 1, j - 1, k).onPlayerAction(tileComponent);
    this.getTile(i - 1, j + 0, k).onPlayerAction(tileComponent);
  }

  /**
   * Gets the cells height by searching up and down until a tile is found
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getCellHeight(i: number, j: number, k: number) {
    let height = k;
    try {
      // if it is empty search down to zero
      if (this.isEmpty(i, j, k) && k > 0) {
        while (this.isEmpty(i, j, --k) && k > 0) {
          height = k;
        }
      } else {
        // else search up
        while (!this.isEmpty(i, j, ++k)) {
          height = k;
        }
      }
    } catch (e) {
      //NOP
    }
    return height;
  }

  /**
   * Get the tile at this location. If there is none just return empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getTile(i: number, j: number, k: number) {
    let tile: TileComponent = this._tileFactory.empty;

    if (this._tiles[k] != undefined && this._tiles[k][j] != undefined) {
      tile = this._tiles[k][j][i] ?? this._tileFactory.empty;
    }
    return tile;
  }

  /**
   * Get the cell type. x y and z are int cells values
   * @param i
   * @param j
   * @param k
   */
  getCellTypeAndSprite(i: number, j: number, k: number): string {
    let type = 'empty';
    try {
      // subtract 10 because all the cell indices are offset by 10
      const typeIndex = this._levelData.cells[k][j][i] - 10 ?? 0;
      type = this._levelData.typesAndSprites[typeIndex] ?? 'empty';

      // this is used as a separator between groups of 10 tile types.
      // it's there to make the json easier to read. It also means empty.
      if (type == '---') {
        type = 'empty';
      }
    } catch (e) {
      //NOP we will just return empty
    }
    return type;
  }

  /**
   * Perform hit test
   * @param touchPoint
   */
  hitTest(e: TouchSurfaceEvent) {
    console.debug('touch event ' + e.touchPoint);
    //TODO do hit test on the tiles
  }

  /**
   * Can the player access this tile
   * @param x screen space
   * @param y screen space
   * @param z screen space
   * @returns true if the player can access this cell
   */
  canAccessTile(tileComponent: TileComponent, i: number, j: number, k: number): boolean {
    let tile = this.getTile(i, j, k);
    return tile.canAccessTile(tileComponent);
  }

  /**
   * When a tile access another tile
   * @param tileComponent
   * @param i
   * @param j
   * @param k
   * @returns
   */
  onEnter(tileComponent: TileComponent, i: number, j: number, k: number) {
    let tile = this.getTile(i, j, k);
    return tile.onEnter(tileComponent);
  }

  /**
   * Fired when a tile exits a cell
   * @param x
   * @param y
   * @param z
   */
  onExit(tileComponent: TileComponent, i: number, j: number, k: number) {
    let tile = this.getTile(i, j, k);
    return tile.onExit(tileComponent);
  }

  /**
   * Update the sprite controller and actions
   * @param dt
   */
  update(dt: number) {
    this._spriteController.update(dt);
    for (const tile of this._updateTiles) {
      tile.update(dt);
    }
  }
}
