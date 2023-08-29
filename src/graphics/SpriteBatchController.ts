import { Engine } from '../core/Engine';
import { IQuadModel } from '../graphics/GlBuffer';
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
export class SpritBatchController extends SpritBaseController implements ISpriteController {
  private _sprites: Map<string, Sprite>;
  private _activeSprite: string;

  /** The sprite */
  get sprite(): Sprite {
    return this.getSprite(this._activeSprite);
  }

  /**
   * Get the number of sprites
   */
  get spriteCount(): number {
    return this._spriteData.tiles.length;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sprites = new Map<string, Sprite>();
  }

  /**
   * setup the sprite
   * @param texture
   * @param spriteData
   */
  initialize(texture: Texture, spriteData: ISpriteData, defaultSprite?: string | number) {
    super.initialize(texture, spriteData, defaultSprite);
  }

  /**
   * A way of keeping track of our sprites
   * @param id
   * @returns
   */
  private getSprite(id: string): Sprite {
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
  activeSprite(spriteId: string) {
    this._activeSprite = spriteId;
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
    const quads: IQuadModel[] = [];
    //console.debug('Committing ' + this._sprites.size);
    this._sprites.forEach((sprite) => {
      quads.push(sprite.quad);
    });

    // update the buffer
    this._buffer.setBuffers(quads, false);
  }

  render() {
    const vertexCount = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
