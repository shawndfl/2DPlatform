import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import CharacterImage from '../assets/characters.png';
import CharacterData from '../assets/characters.json';
import TileImage from '../assets/isometricTile.png';
import TileData from '../assets/isometricTile.json';
import MenuImage from '../assets/menu.png';
import MenuData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { IFontData } from '../graphics/IFontData';
import { ISpriteData } from '../graphics/ISpriteData';

/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  private _font: Texture;
  private _character: Texture;
  private _tile: Texture;
  private _menu: Texture;

  get font(): { texture: Texture; data: IFontData[] } {
    return { texture: this._font, data: FontData };
  }

  get character(): { texture: Texture; data: ISpriteData[] } {
    return { texture: this._character, data: CharacterData };
  }

  get tile(): { texture: Texture; data: ISpriteData[] } {
    return { texture: this._tile, data: TileData };
  }

  get menu(): { texture: Texture; data: ISpriteData[] } {
    return { texture: this._menu, data: MenuData };
  }

  constructor(eng: Engine) {
    super(eng);
  }

  async initialize() {
    this._tile = new Texture(this.gl);
    await this._tile.loadImage(TileImage);

    this._character = new Texture(this.gl);
    await this._character.loadImage(CharacterImage);

    this._font = new Texture(this.gl);
    await this._font.loadImage(FontImage);

    this._menu = new Texture(this.gl);
    await this._menu.loadImage(MenuImage);
  }
}
