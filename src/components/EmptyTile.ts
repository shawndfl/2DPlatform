import { EmptyTileId } from '../core/EmptyTileId';
import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { TileFactory } from '../systems/TileFactory';
import { TileComponent } from './TileComponent';

/**
 * An empty tile is one that doesn't render anything
 */
export class EmptyTile extends TileComponent {
  protected _tileId: string;
  protected _spriteId: string;
  protected _type: string;

  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return this._type;
  }

  get spriteController(): SpritBaseController {
    return null;
  }

  constructor(eng: Engine, i?: number, j?: number, k?: number) {
    super(eng);
    this._type = EmptyTileId;
    this._spriteId = EmptyTileId;
    if (i && j && k) {
      this._tileId = TileFactory.createStaticID(i, j, k);
      this.setTilePosition(i, j, k);
    } else {
      this._tileId = EmptyTileId;
    }
  }
}
