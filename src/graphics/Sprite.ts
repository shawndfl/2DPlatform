import mat2 from '../math/mat2';
import vec2 from '../math/vec2';
import { IQuadModel } from './GlBuffer';
import { Texture } from './Texture';
import * as MathConst from '../math/constants';

export enum SpriteFlip {
  None,
  XFlip,
  YFlip,
  Both,
}

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
  private _position: { x: number; y: number };

  /** the depth of the bottom 2 verts of the sprite -1 is nearest 1 is farthest  */
  private _depth: number;

  /** is the sprite flipped some way */
  private _spriteFlip: SpriteFlip;

  /** sprite rotation in degrees */
  private _spriteRotate: number;

  /** The scale image and keep the aspect ratio  */
  private _scale: { x: number; y: number };

  /** Screen size */
  private _screenSize: { width: number; height: number };

  /** this is used to offset a sprites position so it can be centered on a tile */
  private _positionOffset: { x: number; y: number };

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
      min: [-1, -1, -1],
      max: [1, 1, 1],
      minTex: [0, 0],
      maxTex: [1, 1],
    };
    this._position = { x: 0, y: 0 };
    this._spriteLoc = { x: 0, y: 0, width: 0, height: 0 };

    this._spriteSheetSize = {
      width: spriteSheetSize.width,
      height: spriteSheetSize.height,
    };
    this._screenSize = { width: screenWidth, height: screenHeight };
    this._spriteFlip = SpriteFlip.None;
    this._spriteRotate = 0;
    this._scale = { x: 1.0, y: 1.0 };
    this._depth = 0;
    this._positionOffset = { x: 0, y: 0 };
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
      this._scale = { x: scale, y: scale };
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
      this._quad.minTex = [maxX, minY];
      this._quad.maxTex = [minX, maxY];
    } else if (this._spriteFlip == SpriteFlip.YFlip) {
      this._quad.minTex = [minX, maxY];
      this._quad.maxTex = [maxX, minY];
    } else if (this._spriteFlip == SpriteFlip.Both) {
      this._quad.minTex = [maxX, maxY];
      this._quad.maxTex = [minX, minY];
    } else {
      this._quad.minTex = [minX, minY];
      this._quad.maxTex = [maxX, maxY];
    }

    // convert to screen space, min is the top left corner

    this._quad.min = [
      this._position.x + this._positionOffset.x,
      this._position.y + this._positionOffset.y,
      this._depth,
    ];
    const spriteWidth = this._spriteLoc.width * this._scale.x;
    const spriteHeight = this._spriteLoc.height * this._scale.y;

    // max is the bottom right
    this._quad.max = [
      this._quad.min[0] + spriteWidth,
      this._quad.min[1] + spriteHeight,
      this._depth,
    ];

    // if we have some rotation then apply it
    if (!MathConst.equals(this._spriteRotate, 0.0)) {
      let minTmp = new vec2([-this._quad.min[0], -this._quad.min[1]]);
      let maxTmp = new vec2([-this._quad.max[0], -this._quad.max[1]]);
      const rotation = new mat2();
      rotation.setIdentity();

      rotation.rotate(MathConst.toRadian(this._spriteRotate));

      minTmp.multiplyMat2(rotation);
      maxTmp.multiplyMat2(rotation);

      this._quad.min[0] = minTmp.x + this._quad.min[0];
      this._quad.min[1] = minTmp.y + this._quad.min[1];
      this._quad.max[0] = maxTmp.x + this._quad.max[0];
      this._quad.max[1] = maxTmp.y + this._quad.max[1];
    }
  }
}
