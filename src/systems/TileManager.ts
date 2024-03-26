import { IImageTiles } from '../_game/data/ILevelData';
import { Component } from '../components/Component';
import { TileImageComponent } from '../components/TileImageComponet';
import { Engine } from '../core/Engine';
import { SpriteData } from '../graphics/ISpriteData';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../graphics/SpriteInstanceController';
import { Texture } from '../graphics/Texture';

/**
 * Manages different backgrounds and foregrounds in a level
 */
export class TileManager extends Component {
  private tiles: TileImageComponent[] = [];

  protected spriteCollections: SpriteInstanceCollection;
  protected tileTexture: Texture;
  protected spriteData: SpriteData;

  constructor(eng: Engine) {
    super(eng);
    this.tileTexture = new Texture('tileTexture', eng.gl);
    this.spriteCollections = new SpriteInstanceCollection(eng);
  }

  async loadTexture(tileSheetUrl: string): Promise<void> {
    // get the tile texture
    await this.tileTexture.loadImage(tileSheetUrl + '.png');
    const spriteDataString = await this.eng.remote.loadFile(tileSheetUrl + '.json');
    if (!spriteDataString) {
      console.error('cannot find ' + tileSheetUrl + '.json');
      return;
    }

    const iSpriteData = JSON.parse(spriteDataString);
    this.spriteData = new SpriteData(iSpriteData);

    // manage instances sprites
    this.spriteCollections.initialize(this.tileTexture, this.spriteData);
  }

  createTile(tile: IImageTiles): void {
    // create the background
    const id = tile.id ?? this.eng.random.getUuid();
    const tileComponent = new TileImageComponent(this.eng, id);
    const sprite = new SpriteInstanceController(id, this.spriteCollections);

    tileComponent.initialize(sprite, tile);
  }

  update(dt: number) {
    this.tiles.forEach((t) => t.update(dt));
    this.spriteCollections.update(dt);
  }

  dispose(): void {
    this.tiles.forEach((bg) => bg.dispose());
  }
}
