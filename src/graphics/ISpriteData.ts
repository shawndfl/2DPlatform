export interface TileData {
  /**
   *  the id of the sprite data
   */
  id: string;

  /**
   * Rotation in degrees 0, 90, 180, 270
   */
  rotate?: number;

  /**
   * Flip the image horizontal
   */
  flip?: boolean;

  /**
   * Offset the the image. X, Y, Flipped X, flipped Y
   */
  offset?: [number, number, number, number];

  /**
   * the location of the sprite data in the sprite sheet. This will
   * override what ever is in the index field. This is in pixels of
   * the sprite sheet [x,y, width, height]
   */
  loc?: [number, number, number, number];
}

/**
 * This interface is used to describe a sprite in a sprite sheet
 */
export interface ISpriteData {
  /**
   * Tile data
   */
  tiles: TileData[];
}
