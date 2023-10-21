import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import MenuImage from '../assets/menu.png';
import MenuData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { IFontData } from '../graphics/IFontData';
import { ISpriteData } from '../graphics/ISpriteData';

/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  protected _font: Texture;
  protected _menu: Texture;

  get font(): { texture: Texture; data: IFontData[] } {
    return { texture: this._font, data: FontData };
  }

  get menu(): { texture: Texture; data: ISpriteData } {
    return { texture: this._menu, data: MenuData };
  }

  /**
   * For implementation
   * @param id 
   * @returns 
   */
  getTexture(id: string): { texture: Texture; data: ISpriteData } {
    return { texture: null, data: null };
  }

  constructor(eng: Engine) {
    super(eng);
  }

  async initialize() {
    this._font = new Texture(this.gl);
    await this._font.loadImage(FontImage);

    this._menu = new Texture(this.gl);
    await this._menu.loadImage(MenuImage);
  }
}
