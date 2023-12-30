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
  static readonly menu: string = 'menu';
}

export interface ISpriteTexture {
  tile: TileData;
  texture: Texture;
}

/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  protected _font: Texture;
  protected textures: Map<string, { texture: Texture; data: ISpriteData }>;
  protected spriteTextures: Map<string, ISpriteTexture>;

  get font(): { texture: Texture; data: IFontData[] } {
    return { texture: this._font, data: FontData };
  }

  get menu(): { texture: Texture; data: ISpriteData } {
    return this.textures.get(BuiltInTextureAssets.menu);
  }

  /**
   * For implementation
   * @deprecated use getSprite()
   * @param id
   * @returns
   */
  getTexture(id: string): { texture: Texture; data: ISpriteData } {
    return this.textures.get(id);
  }

  /**
   * This is used to get the sprite location, in a sprite sheet texture
   * @param name
   * @returns
   */
  getSprite(name: string): ISpriteTexture {
    const sprite = this.spriteTextures.get(name);
    if (!sprite) {
      console.error('cannot find sprite ' + name);
    }
    return sprite;
  }
  /**
   * Create a map of textures
   * @param eng
   */
  constructor(eng: Engine) {
    super(eng);
    this.textures = new Map<string, { texture: Texture; data: ISpriteData }>();
    this.spriteTextures = new Map<string, ISpriteTexture>();
  }

  /**
   * Initialize built in textures
   */
  async initialize() {
    this._font = new Texture(this.gl);
    await this._font.loadImage(FontImage);

    this.textures.set(BuiltInTextureAssets.menu, {
      texture: await this.loadTexture(MenuImage),
      data: MenuData,
    });

    this.textures.forEach((t, key) => {
      t.data.tiles.forEach((d) => {
        const newKey = key + '.' + d.id;
        if (!this.spriteTextures.has(newKey)) {
          this.spriteTextures.set(newKey, {
            texture: t.texture,
            tile: d,
          });
        } else {
          console.error("sprite with id '" + newKey + "' already exists!");
        }
      });
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
