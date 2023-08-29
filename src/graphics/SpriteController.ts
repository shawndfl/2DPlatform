import { Engine } from '../core/Engine';
import { ISpriteData } from '../graphics/ISpriteData';
import { Sprite } from '../graphics/Sprite';
import { Texture } from './Texture';
import { ISpriteController } from './ISprintController';
import { SpritBaseController } from './SpriteBaseController';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export class SpritController extends SpritBaseController implements ISpriteController {
  private _sprite: Sprite;

  get sprite(): Sprite {
    return this._sprite;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sprite = new Sprite();
  }

  /**
   * setup the sprite
   * @param texture
   * @param spriteData
   */
  initialize(texture: Texture, spriteData: ISpriteData, defaultSprite?: string | number) {
    super.initialize(texture, spriteData);

    // set up the sprite
    this.sprite.initialize(
      { width: texture.width, height: texture.height },
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    // set a default sprite
    this.setSprite(defaultSprite);

    // set the position of the sprite on the screen
    this.sprite.setPosition(0, 0, 0);
  }

  commitToBuffer() {
    this._buffer.setBuffers([this._sprite.quad], false);
  }

  render() {
    const vertexCount = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
