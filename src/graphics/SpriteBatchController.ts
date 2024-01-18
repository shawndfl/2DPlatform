import { Engine } from '../core/Engine';
import { IQuadModel } from '../geometry/GlBuffer';
import { ISpriteData, SpriteData } from '../graphics/ISpriteData';
import { Sprite } from '../graphics/Sprite';
import { Texture } from './Texture';
import { SpritBaseController } from './SpriteBaseController';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export class SpritBatchController extends SpritBaseController {
  private _sprites: Map<string, Sprite>;
  private _activeSprite: string;
  private _quads: IQuadModel[];
  /** The sprite */
  get sprite(): Sprite {
    return this.getSprite(this._activeSprite);
  }

  /**
   * Get the number of sprites
   */
  get spriteCount(): number {
    return this._spriteData.tiles.size;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sprites = new Map<string, Sprite>();
    this._quads = [];
  }

  /**
   * setup the sprite
   * @param texture
   * @param spriteData
   */
  initialize(
    texture: Texture,
    spriteData: SpriteData,
    defaultSprite?: string | number
  ) {
    super.initialize(texture, spriteData, defaultSprite);
    // set active sprite to the first  key
    for (let key of this._sprites.keys()) {
      this._activeSprite = key;
      break;
    }
  }

  /**
   * A way of keeping track of our sprites
   * @param id
   * @returns
   */
  private getSprite(id: string): Sprite {
    if (!this._spriteTexture) {
      console.error('call initialize first.');
      return null;
    }
    let sprite = this._sprites.get(id);
    if (!this._sprites.has(id)) {
      // create new sprite and initialize it
      sprite = new Sprite(id);
      sprite.initialize(
        {
          width: this._spriteTexture.width,
          height: this._spriteTexture.height,
        },
        this.gl.canvas.width,
        this.gl.canvas.height
      );
      this._sprites.set(id, sprite);
    }
    return sprite;
  }

  /**
   * Do we have a sprite with this id
   * @param id
   * @returns
   */
  hasSprite(id: string) {
    return this._sprites.has(id);
  }

  /**
   * clear all sprites
   */
  clearAllSprites() {
    this._sprites.clear();
    this._dirty = true;
  }

  /**
   * Sets an active sprite
   * @param spriteId
   */
  activeSprite(spriteId: string): SpritBatchController {
    this._activeSprite = spriteId;
    return this;
  }

  /**
   * remove a sprite. You will need to call Commit for the
   * sprite to be removed.
   * @param spriteId
   * @returns
   */
  removeSprite(spriteId: string): boolean {
    this._dirty = true;
    return this._sprites.delete(spriteId);
  }

  /**
   * Commit all sprites to the buffer
   */
  commitToBuffer() {
    if (this._quads.length < this._sprites.size) {
      this._quads = new Array(this._sprites.size);
    }

    let i = 0;
    this._sprites.forEach((sprite) => {
      this._quads[i++] = sprite.quad;
    });

    // update the buffer
    this._buffer.setBuffers(this._quads, false, undefined, this._sprites.size);
  }

  render() {
    const vertexCount = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
