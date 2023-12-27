import { SpritBaseController } from '../../graphics/SpriteBaseController';
import rect from '../../math/rect';
import { GroundManager } from '../system/GroundManager';
import { EmptyTileId } from './EmptyTileId';
import { TileComponent } from './TileComponent';

/**
 * An empty tile is one that doesn't render anything
 */
export class EmptyTile extends TileComponent {
  get spriteController(): SpritBaseController {
    return null;
  }

  public get screenBounds(): Readonly<rect> {
    this._screenBounds.left = this._screenPosition.x;
    this._screenBounds.width = TileComponent.tileWidth;
    this._screenBounds.height = TileComponent.tileHeight;
    this._screenBounds.top = this._screenPosition.y;
    return this._screenBounds;
  }

  get id(): string {
    return EmptyTileId;
  }

  constructor(gm: GroundManager, i?: number, j?: number) {
    super(gm, { tileClass: 'EmptyTile', spriteName: null, i, j, options: [] });

    if (i && j) {
      this.setTilePosition(i, j);
    }
  }
}
