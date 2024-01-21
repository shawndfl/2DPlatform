import { Engine } from '../core/Engine';
import { DefaultSpriteData } from '../graphics/ISpriteData';
import { SpriteController2 } from '../graphics/SpriteController2';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { Component } from './Component';

/**
 * This is a simple background image that scrolls behind the level
 */
export class BackgroundComponent extends Component {
  texture: Texture;
  sprite: SpriteController2;

  public get id(): string {
    return this._id;
  }

  constructor(eng: Engine, private _id: string) {
    super(eng);
    this.texture = new Texture(this.id, eng.gl);
    this.sprite = new SpriteController2(this.eng);
  }

  async initialize(image: string, levelSize: vec2): Promise<void> {
    await this.texture.loadImage(image);
    this.sprite.initialize(this.texture, DefaultSpriteData);
    this.sprite.spriteImage('default');
    const scaleX = levelSize.x / this.texture.width;
    const scaleY = levelSize.y / this.texture.height;

    this.sprite.depth = 0.8;

    this.sprite.top = this.texture.height * scaleY * 0.5;
    this.sprite.left = this.texture.width * scaleX * 0.5;
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
