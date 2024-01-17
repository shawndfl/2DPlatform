import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { PlatformEngine } from '../PlatformEngine';
import { GameComponent } from '../components/GameComponent';
import { ILevelData } from '../data/ILevelData';
import { TileComponent } from '../tiles/TileComponent';
import { TileFactory } from '../tiles/TileFactorey';
import { TextureAssets } from './GameAssetManager';

export class GroundManager extends GameComponent {
  private _staticSprite: SpritBatchController;

  private _tileFactory: TileFactory;
  protected _levelData: ILevelData;
  private tiles: TileComponent[][];
  private tilesToUpdate: TileComponent[];

  public get staticSprite() {
    return this._staticSprite;
  }

  public get tileFactory() {
    return this._tileFactory;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this._staticSprite = new SpritBatchController(this.eng);
    this._tileFactory = new TileFactory(this);
    this.tiles = [[]];
  }

  buildLines(): void {}

  loadLevel(level: ILevelData): void {
    this.dispose();
    this._levelData = level;

    this.buildLines();

    // get the level size in pixels
    const levelPixelWidth =
      TileComponent.tileWidth * ((level.encode[0].length - 1) / 2);
    const levelPixelHeight =
      TileComponent.tileHeight * (level.encode.length - 1);

    // initialize the quad tree size
    this.eng.physicsManager.initializeBounds(levelPixelWidth, levelPixelHeight);

    // set the max range of the view manager
    this.eng.viewManager.minX = 0;
    this.eng.viewManager.minY = 0;
    this.eng.viewManager.maxX = levelPixelWidth;
    this.eng.viewManager.maxY = levelPixelHeight;

    const columnCount = level.encode[0].length;
    this.tilesToUpdate = [];

    for (let j = 0; j < level.encode.length; j++) {
      this.tiles.push([]);
      const invertedJ = level.encode.length - 1 - j;
      const row = level.encode[invertedJ];
      for (let s = 0; s < columnCount; s += 2) {
        const i = s / 2;
        let element = row[s] + row[s + 1];

        // all row lengths need to match the
        // length of the first row. This allows
        // us to leave off trailing 00's to save space
        if (s < row.length) {
          element = row[s] + row[s + 1];
        } else {
          element = '00';
        }
        const index = parseInt(element, 16);
        const type = level.tiles[index];
        const tile = this.tileFactory.create(type, i, j);
        tile.initialize();

        // add tiles to update list
        if (tile.requiresUpdate) {
          this.tilesToUpdate.push(tile);
        }

        this.tiles[j].push(tile);
      }
    }
  }

  /**
   * Initial the sprites
   */
  initialize(): void {
    const assets = this.eng.assetManager.getTexture(TextureAssets.level1Tile);
    this._staticSprite.initialize(assets.texture, assets.data);
  }

  /**
   * Get a tile at this location
   * @param i - in tile space
   * @param j - in tile space
   * @param k - in tile space
   * @returns
   */
  getTileAt(i: number, j: number, k: number): TileComponent {
    if (!this.tiles[j] || !this.tiles[j][i]) {
      return null;
    }
    let tile = this.tiles[j][i];
    if (!tile.empty) {
      return tile;
    }
    return null;
  }

  update(dt: number): void {
    //this._staticSprite.update(dt);
    //this.tilesToUpdate.forEach((t) => t.update(dt));
  }

  dispose(): void {
    for (let j = 0; j < this.tiles.length; j++) {
      for (let i = 0; i < this.tiles[j].length; i++) {
        this.tiles[j][i]?.dispose();
      }
    }

    this.tiles = [[]];
  }
}
