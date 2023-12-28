import mat2 from '../math/mat2';
import vec2 from '../math/vec2';
import { IQuadModel } from '../geometry/GlBuffer';
import { Texture } from './Texture';
import * as MathConst from '../math/constants';
import vec3 from '../math/vec3';
import mat4 from '../math/mat4';
import { SpriteFlip } from './ISprite';

/**
 * This is a utility class that is used to create a IQuadModel that
 * is used to create a GLBuffer.
 */
export class Sprite {
  /** referencing the sprite. Used in collections */
  private _tag: string;

  /** The width and height in pixels of the sprite within the sprite sheet */
  private _spriteLoc: { x: number; y: number; width: number; height: number };

  /** The width and height of the texture in pixels*/
  private _spriteSheetSize: { width: number; height: number };

  /** The position in pixels of the canvas where the sprite will go. */
  private _position: vec2;

  /** the depth of the bottom 2 verts of the sprite -1 is nearest 1 is farthest  */
  private _depth: number;

  /** is the sprite flipped some way */
  private _spriteFlip: SpriteFlip;

  /** sprite rotation in degrees */
  private _spriteRotate: number;

  /** The scale image and keep the aspect ratio  */
  private _scale: vec2;

  /** this is used to offset a sprites position so it can be centered on a tile */
  private _positionOffset: vec2;

  /** this is used by the buffer */
  private _quad: IQuadModel;

  get tag(): string {
    return this._tag;
  }

  /**
   * Get the position in pixels.
   */
  get position(): { x: number; y: number } {
    return this._position;
  }

  get depth(): number {
    return this._depth;
  }

  get rotation(): number {
    return this._spriteRotate;
  }

  getSpriteWidth(): number {
    return this._spriteLoc.width * this._scale.x;
  }

  getSpriteHeight(): number {
    return this._spriteLoc.height * this._scale.y;
  }

  get quad() {
    return this._quad;
  }

  constructor(tag?: string) {
    this._tag = tag;
    this.initialize({ width: 0, height: 0 }, 800, 600);
  }

  /**
   * Setup the sprite with a sprite sheet and screen size. All calculations are done in
   * pixels.
   * @param spriteSheet
   * @param screenWidth
   * @param screenHeight
   */
  initialize(
    spriteSheetSize: { width: number; height: number },
    screenWidth: number,
    screenHeight: number
  ) {
    this._quad = {
      min: new vec3([-1, -1, -1]),
      max: new vec3([1, 1, 1]),
      minTex: new vec2([0, 0]),
      maxTex: new vec2([1, 1]),
      transform: new mat4(),
    };

    this._position = new vec2();
    this._spriteLoc = { x: 0, y: 0, width: 0, height: 0 };

    this._spriteSheetSize = {
      width: spriteSheetSize.width,
      height: spriteSheetSize.height,
    };
    this._spriteFlip = SpriteFlip.None;
    this._spriteRotate = 0;
    this._scale = new vec2([1.0, 1.0]);
    this._depth = 0;
    this._positionOffset = new vec2();
  }

  /**
   * This function is used to select a sprite from the sprite sheet
   */
  setSprite(opt: {
    pixelXOffset: number;
    pixelYOffset: number;
    spriteWidth: number;
    spriteHeight: number;
  }) {
    this._spriteLoc.x = opt.pixelXOffset;
    this._spriteLoc.y = opt.pixelYOffset;
    this._spriteLoc.width = opt.spriteWidth;
    this._spriteLoc.height = opt.spriteHeight;

    this.calculateQuad();
  }

  getSpriteFlip(): SpriteFlip {
    return this._spriteFlip;
  }

  setSpriteFlip(spriteFlip: SpriteFlip) {
    this._spriteFlip = spriteFlip ?? SpriteFlip.None;

    this.calculateQuad();
  }

  /**
   * Scale can be set uniform as one number or as separate components (x,y).
   * @param scale a number or {x: number, y: number}
   */
  setSpriteScale(scale: number | { x: number; y: number }) {
    if (typeof scale === 'number') {
      this._scale.x = scale;
      this._scale.y = scale;
    } else {
      this._scale.x = scale.x;
      this._scale.y = scale.y;
    }

    this.calculateQuad();
  }

  /**
   * Sets an offset for the position based on what the image is.
   * This allows sprites to be position in the cells correctly.
   * @param x in pixels
   * @param y in pixels
   */
  setSpritePositionOffset(x: number, y: number) {
    this._positionOffset.x = x;
    this._positionOffset.y = y;
  }

  /**
   * Set the rotate of the sprite
   * @param rotation rotation in degrees
   */
  setSpriteRotate(rotation: number = 1.0) {
    this._spriteRotate = rotation;

    this.calculateQuad();
  }

  /**
   * Set  x and y in pixels and depth in screen space
   * @param x
   * @param y
   * @param depth screen space [-1, 1]. 1 is far -1 is close
   */
  setPosition(x: number, y: number, depth?: number) {
    this._position.x = x;
    this._position.y = y;
    if (depth != undefined) {
      this._depth = depth;
    }

    this.calculateQuad();
  }

  /**
   * Builds a IQuadModel
   */
  calculateQuad() {
    const sheetW = this._spriteSheetSize.width;
    const sheetH = this._spriteSheetSize.height;
    let minX = this._spriteLoc.x / sheetW;
    let minY = 1.0 - this._spriteLoc.y / sheetH;
    let maxX = (this._spriteLoc.x + this._spriteLoc.width) / sheetW;
    let maxY = 1.0 - (this._spriteLoc.y + this._spriteLoc.height) / sheetH;

    if (this._spriteFlip == SpriteFlip.XFlip) {
      this._quad.minTex.x = maxX;
      this._quad.minTex.y = minY;
      this._quad.maxTex.x = minX;
      this._quad.maxTex.y = maxY;
    } else if (this._spriteFlip == SpriteFlip.YFlip) {
      this._quad.minTex.x = minX;
      this._quad.minTex.y = maxY;
      this._quad.maxTex.x = maxX;
      this._quad.maxTex.y = minY;
    } else if (this._spriteFlip == SpriteFlip.Both) {
      this._quad.minTex.x = maxX;
      this._quad.minTex.y = maxY;
      this._quad.maxTex.x = minX;
      this._quad.maxTex.y = minY;
    } else {
      this._quad.minTex.x = minX;
      this._quad.minTex.y = minY;
      this._quad.maxTex.x = maxX;
      this._quad.maxTex.y = maxY;
    }

    // set the offset
    this._quad.min.x = this._positionOffset.x;
    this._quad.min.y = this._positionOffset.y;
    this._quad.min.z = this._depth;

    this._quad.max.x = this._spriteLoc.width + this._positionOffset.x;
    this._quad.max.y = this._spriteLoc.height + this._positionOffset.y;
    this._quad.max.z = this._depth;

    // rotate and scale
    const transform = this._quad.transform.setIdentity();
    transform.setIdentity();
    transform.rotate(MathConst.toRadian(this._spriteRotate), vec3.forward);
    transform.scale(this._scale);
    transform.translate(this._position);

    // transform min and max
    transform.multiplyVec3(this._quad.max, this._quad.max);
    transform.multiplyVec3(this._quad.min, this._quad.min);
  }
}
