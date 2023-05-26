import { EmptyTileId } from '../core/EmptyTileId';
import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import vec3 from '../math/vec3';
import { GroundManager } from '../systems/GroundManager';
import { Component } from './Component';

/**
 * A tile component is a component that controls a single tile.
 * The visual sprite might be part of a spriteBatch or a single sprite.
 * This is up to the implementation. This class has functions that
 * allow the implementation to handle collision detection and response and
 * update state of other tiles as needed via the {@link Ground}.
 */
export abstract class TileComponent extends Component {
  /**
   * Tile position as a float
   */
  protected _tilePosition: vec3;
  /**
   * Tile position as an int. Used in look up tables
   */
  protected _tileIndex: vec3;

  /**
   * This the is world location of the tile. z component
   * is the depth which is between 1 and -1
   */
  private _screenPosition: vec3;

  /**
   * This is the tile height index. Subtract one because
   * the tile is one level above the cell it is on.
   */
  get tileHeightIndex(): number {
    return this._tileIndex.z - 1;
  }

  /**
   * Is this tile empty
   */
  get empty() {
    return this.type == EmptyTileId;
  }

  /**
   * Get the tile index
   */
  get tileIndex(): vec3 {
    return this._tileIndex;
  }

  /**
   * get the screen location of the tile
   */
  get screenPosition(): vec3 {
    return this._screenPosition;
  }

  /**
   * Easy access to ground
   */
  get groundManager(): GroundManager {
    return this.eng.scene.ground;
  }

  /**
   * Get the height offset in tile space
   */
  get tileHeight(): number {
    return this._tilePosition.z;
  }

  /**
   * get the tile position
   */
  get tilePosition(): vec3 {
    return this._tilePosition;
  }

  /**
   * Sprite for this tile
   */
  abstract get spriteController(): SpritBaseController;

  /**
   * Gets the id of the thing
   */
  abstract get id(): string;

  /**
   * Gets the type of the tile component
   */
  abstract get type(): string;

  constructor(eng: Engine) {
    super(eng);

    this._tileIndex = new vec3([0, 0, 0]);
    this._tilePosition = new vec3([0, 0, 0]);
  }

  /**
   * Set the position in tile space. This will recalculate the tile position
   * and set the sprite position.
   * @param i
   * @param j
   * @param k
   */
  setTilePosition(i: number, j: number, k: number) {
    if (this.type == 'player') {
      console.debug('setting player position ', i, j, k);
    }
    this._tilePosition.x = i;
    this._tilePosition.y = j;
    this._tilePosition.z = k;

    this._tileIndex.x = Math.floor(this._tilePosition.x);
    this._tileIndex.y = Math.floor(this._tilePosition.y);
    this._tileIndex.z = Math.floor(this._tilePosition.z);

    this.updateSpritePosition();
  }

  /**
   * Can this tile be accessed by the given component. This happens when a player tries to move to a tile.
   * It can also happen when an NPC tile tries to access a another tile
   * @param tileComponent
   * @returns
   */
  canAccessTile(tileComponent: TileComponent): boolean {
    if (this.empty) {
      //console.warn('empty component');
    } else {
      console.warn(' default component');
    }
    return false;
  }

  /**
   * When a cell is created
   */
  onCreate() {
    //NOP
  }

  /**
   * When a cell is destroyed
   */
  onDestroy() {
    //NOP
  }

  /**
   * Called when the player hits the action button
   * @param tileComponent
   */
  onPlayerAction(tileComponent: TileComponent) {
    //NOP
  }

  /**
   * Called when a tile tries to enter this tile. This happens after canAccessTile returns true
   * @param tileComponent
   */
  onEnter(tileComponent: TileComponent) {
    //NOP
  }

  /**
   * Exit a this tile
   * @param tileComponent
   */
  onExit(tileComponent: TileComponent) {
    //NOP
  }

  /**
   * This is only called if require update returns true when
   * this object is created. This is called form GroundManager
   * @param dt
   */
  update(dt: number) {
    //NOP
  }

  /**
   * Moves the tile by a given amount
   * @param i
   * @param j
   * @param k
   */
  OffsetTilePosition(i: number, j: number, k: number) {
    const tileX = Math.floor(this._tilePosition.x);
    const tileY = Math.floor(this._tilePosition.y);
    const tileZ = Math.floor(this._tilePosition.z);
    const floorHeight = tileZ - 1;

    const fractionI = this.tilePosition.x % 1;
    const fractionJ = this.tilePosition.y % 1;
    const dir = new vec3([i, j, k]);

    const ground = this.eng.scene.ground;

    // left
    if (dir.x < 0 && fractionI < 0.25) {
      // cancel x movement
      if (!ground.canAccessTile(this, tileX - 1, tileY, floorHeight)) {
        dir.x = 0;
      }
    }

    // right
    else if (dir.x > 0 && fractionI > 0.75) {
      // cancel x movement
      if (!ground.canAccessTile(this, tileX + 1, tileY, floorHeight)) {
        dir.x = 0;
      }
    }

    // up
    if (dir.y < 0 && fractionJ < 0.25) {
      // cancel y movement
      if (!ground.canAccessTile(this, tileX, tileY - 1, floorHeight)) {
        dir.y = 0;
      }
    }
    // down
    else if (dir.y > 0 && fractionJ > 0.75) {
      // cancel y movement
      if (!ground.canAccessTile(this, tileX, tileY + 1, floorHeight)) {
        dir.y = 0;
      }
    }

    // check corners
    if (dir.x > 0 && dir.y > 0 && fractionJ > 0.75 && fractionI > 0.75) {
      //top right
      if (!ground.canAccessTile(this, tileX + 1, tileY + 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
      //top left
      if (!ground.canAccessTile(this, tileX - 1, tileY + 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y < 0 && fractionJ < 0.25 && fractionI < 0.25) {
      //bottom left
      if (!ground.canAccessTile(this, tileX - 1, tileY - 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
      //bottom right
      if (!ground.canAccessTile(this, tileX - 1, tileY + 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    }

    // check if the player can access this tile
    if (dir.length() > 0) {
      this.moveToTilePosition(this._tilePosition.x + dir.x, this._tilePosition.y + dir.y, this._tilePosition.z + dir.z);
    }
  }

  /**
   * Sets the tile position to a new value
   * @param i
   * @param j
   * @param k
   */
  moveToTilePosition(i: number, j: number, k?: number) {
    if (k === undefined) {
      k = this._tilePosition.z;
    }

    // we need this to be an int to lookup the tiles
    const tileX = Math.floor(i);
    const tileY = Math.floor(j);
    const tileZ = Math.floor(k);

    const floor = tileZ - 1;

    // we moved off the last tile call on exit
    if (this._tileIndex.x != tileX || this._tileIndex.y != tileY) {
      // exit the ground tile
      this.eng.scene.ground.onExit(this, this._tileIndex.x, this._tileIndex.y, floor);

      // exit the tile at eye level
      this.eng.scene.ground.onExit(this, this._tileIndex.x, this._tileIndex.y, floor + 1);
    }

    const screen = this.eng.tileHelper.toScreenLoc(i, j, k);

    // set the tile position first. This will allow onEnter to change the position if needed.
    this.setTilePosition(i, j, k);

    // enter the tile on the ground
    this.eng.scene.ground.onEnter(this, tileX, tileY, floor);

    // enter the tile in front of the player
    this.eng.scene.ground.onEnter(this, tileX, tileY, floor + 1);
  }

  /**
   * Updates the sprite's position
   */
  protected updateSpritePosition() {
    // Get the screen depth using the tile index not position of this tile
    const screenDepth = this.eng.tileHelper.toScreenLoc(this._tileIndex.x, this._tileIndex.y, this._tileIndex.z);

    // Get the screen position of this tile using the position
    this._screenPosition = this.eng.tileHelper.toScreenLoc(
      this._tilePosition.x,
      this._tilePosition.y,
      this._tilePosition.z
    );

    // move the sprite if there is one. some tiles like empty
    // don't need sprite controllers
    if (this.spriteController) {
      this.spriteController.setSpritePosition(this.screenPosition.x, this.screenPosition.y, screenDepth.z);
    }
  }
}
