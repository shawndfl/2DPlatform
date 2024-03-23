import { IImageTiles } from '../_game/data/ILevelData';
import { Engine } from '../core/Engine';
import { DefaultSpriteData, SpriteData } from '../graphics/ISpriteData';
import { SpriteController2 } from '../graphics/SpriteController2';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { Component } from './Component';

/**
 * This is a simple background image that scrolls behind the level
 */
export class TileBgComponent extends Component {
  texture: Texture;
  sprite: SpriteController2;

  public get id(): string {
    return this._id;
  }

  constructor(eng: Engine, private _id: string) {
    super(eng);
    this.sprite = new SpriteController2(this.eng);
  }

  async initialize(texture: Texture, spriteData: SpriteData, options: IImageTiles): Promise<void> {
    this.texture = texture;

    this.sprite.initialize(this.texture, spriteData);
    this.sprite.spriteImage(options.image);
    const scaleX = options.size.x / this.sprite.width;
    const scaleY = options.size.y / this.sprite.height;

    this.sprite.depth = 0.8;
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;
    this.sprite.left = options.pos.x;
    this.sprite.top = options.pos.y;
    this.sprite.xScale = scaleX;
    this.sprite.yScale = scaleY;
  }

  update(dt: number) {
    this.sprite.update(dt);
  }

  dispose(): void {
    if (this.texture) {
      this.texture.dispose();
    }
    if (this.sprite) {
      this.sprite.dispose();
    }
  }
}
