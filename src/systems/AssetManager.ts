import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import MenuImage from '../assets/menu.png';
import MenuData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { IFontData } from '../graphics/IFontData';
import { ISpriteData, SpriteData, TileData } from '../graphics/ISpriteData';

export class BuiltInTextureAssets {
  static readonly menu: string = 'menu';
}

export interface ITextureAsset {
  texture: Texture;
  data: SpriteData;
}

/**
 * Manages texture assets. This only has two that it manages. One is the font
 * the other is the menu.
 */
export class AssetManager extends Component {
  protected _font: Texture;
  protected textures: Map<string, ITextureAsset>;

  get font(): { texture: Texture; data: IFontData[] } {
    return { texture: this._font, data: FontData };
  }

  get menu(): ITextureAsset {
    return this.textures.get(BuiltInTextureAssets.menu);
  }

  /**
   * For implementation
   * @param id
   * @returns
   */
  getTexture(id: string): ITextureAsset {
    return this.textures.get(id);
  }

  /**
   * Create a map of textures
   * @param eng
   */
  constructor(eng: Engine) {
    super(eng);
    this.textures = new Map<string, ITextureAsset>();
  }

  /**
   * Initialize built in textures
   */
  async initialize() {
    this._font = new Texture('font', this.gl);
    await this._font.loadImage(FontImage);
    await this.loadTexture(BuiltInTextureAssets.menu, MenuImage, MenuData);
  }

  /**
   * Loads a texture and saves it in the texture map
   * @param imageFile
   * @returns
   */
  protected async loadTexture(
    id: string,
    imageFile: string,
    data: ISpriteData
  ): Promise<Texture> {
    // create the texture
    const texture = new Texture(id, this.gl);

    // load the texture
    await texture.loadImage(imageFile);

    // store the texture
    this.textures.set(id, { texture, data: new SpriteData(data) });
    return texture;
  }
}
