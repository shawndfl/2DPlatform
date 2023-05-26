import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { SpritController } from '../graphics/SpriteController';
import { TileFactory } from '../systems/TileFactory';
import { Component } from './Component';
import { TileComponent } from './TileComponent';

export class SlopTileComponent extends TileComponent {
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
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  onEnter(tileComponent: TileComponent): void {
    // TODO set the tile component to the correct direction
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    // TODO check if the tile is
    // accessing from the correct location
    return false;
    // if slop is to the left the tile component
    // needs to be entering from the left i-1
    if (this.type.includes('left')) {
      if (
        tileComponent.tileIndex.x == this.tileIndex.x - 1 &&
        tileComponent.tileIndex.y == this.tileIndex.y
      ) {
        //tileComponent.
      }
    }
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
