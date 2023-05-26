import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { TileFactory } from '../systems/TileFactory';
import { TileComponent } from './TileComponent';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class CollideTileComponent extends TileComponent {
  protected _tileId: string;
  protected _spriteId: string;
  protected _type: string;

  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return this._type;
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    console.warn('collision component ');
    return false;
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
    this._spriteController.activeSprite(this._tileId);
    this._spriteController.setSprite(this._spriteId);
    this._spriteController.scale(this.eng.tileScale);

    this.setTilePosition(i, j, k);
  }
}
