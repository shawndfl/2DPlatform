import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import MenuImage from '../assets/menu.png';
import MenuData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { IFontData } from '../graphics/IFontData';
import { ISpriteData, TileData } from '../graphics/ISpriteData';

export class BuiltInTextureAssets {
  static readonly Menu: string = 'menu';
}

/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  protected _font: Texture;
  protected textures: Map<string, { texture: Texture, data: ISpriteData }>;

  get font(): { texture: Texture; data: IFontData[] } {
    return { texture: this._font, data: FontData };
  }

  get menu(): { texture: Texture; data: ISpriteData } {
    return this.textures.get(BuiltInTextureAssets.Menu);
  }

  /**
   * For implementation
   * @param id 
   * @returns 
   */
  getTexture(id: string): { texture: Texture; data: ISpriteData } {
    return { texture: null, data: null };
  }

  /**
   * Get tile data from a texture and a sprit.
   * @param textureId 
   * @param spriteId 
   * @returns 
   */
  getSpriteInfo(id: string, spriteId: string): Readonly<TileData> {
    const texture = this.getTexture(id);
    let tileData: TileData = null;
    if (texture) {
      tileData = texture.data.tiles.find((sprite) => sprite.id == spriteId);
    }
    return tileData;
  }

  /**
   * Create a map of textures
   * @param eng 
   */
  constructor(eng: Engine) {
    super(eng);
    this.textures = new Map<string, { texture: Texture, data: ISpriteData }>
  }

  /**
   * Initialize built in textures
   */
  async initialize() {
    this._font = new Texture(this.gl);
    await this._font.loadImage(FontImage);

    this.textures.set(BuiltInTextureAssets.Menu, {
      texture: await this.loadTexture(MenuImage),
      data: MenuData
    });
  }

  /**
   * Loads a texture
   * @param imageFile 
   * @returns 
   */
  protected async loadTexture(imageFile: string): Promise<Texture> {
    const texture = new Texture(this.gl);
    await texture.loadImage(imageFile);
    return texture;
  }
}
