export interface TileData {
  /**
   *  the id of the sprite data
   */
  id: string;
  /**
   * the location of the sprite data in the sprite sheet.
   * [cols, rows]
   */
  index?: [number, number];

  /**
   * Rotation in degrees 0, 90, 180, 270
   */
  rotate?: number;

  /**
   * Flip the image horizontal
   */
  flip?: boolean;

  /**
   * Offset the the image
   */
  offset?: [number, number];

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
   * The pixel height of a tile. Mostly 24 or 32
   */
  tileHeight?: number;
  /**
   * The pixel width of a tile. Mostly 16 or 32
   */
  tileWidth?: number;

  /**
   * Tile data
   */
  tiles: TileData[];
}


export const FullScreenSprite: ISpriteData =  {
  tileHeight: null,
  tileWidth: null,
  tiles: []
}