import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { TileFactory } from '../systems/TileFactory';
import { TileComponent } from './TileComponent';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class OpenTileComponent extends TileComponent {
  protected _tileId: string;
  protected _spriteId: string;
  protected _type: string;

  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return this._type;
  }

  /**
   * Check if the tile component (or player) can access this tile.
   * For open tiles we need to check the tile on top of it.
   * @param tileComponent
   * @returns
   */
  canAccessTile(tileComponent: TileComponent): boolean {
    // can not access this tile if the player is on top of it
    if (tileComponent.tileIndex.z - 1 !== this.tileIndex.z) {
      return false;
    }

    // see if we can access the tile on top of this tile
    const tileAboveGround = this.groundManager.getTile(this.tileIndex.x, this.tileIndex.y, this.tileIndex.z + 1);
    return tileAboveGround.empty || tileAboveGround.canAccessTile(tileComponent);
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(
    eng: Engine,
    protected _spriteController: SpritBatchController,
    typeAndSprite: string,
    i: number,
    j: number,
    k: number
  ) {
    super(eng);
    const parts = typeAndSprite.split('|');
    this._type = parts[0];
    this._spriteId = parts[1];
    this._tileId = TileFactory.createStaticID(i, j, k);
    this._spriteController.activeSprite(TileFactory.createStaticID(i, j, k));

    this._spriteController.setSprite(this._spriteId);
    this._spriteController.scale(this.eng.tileScale);
    this.setTilePosition(i, j, k);
  }
}
