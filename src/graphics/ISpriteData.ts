/**
 * This interface is used to describe a sprite in a sprite sheet
 */
export interface ISpriteData {
  /** the id of the sprite data */
  id: string;
  /**
   * the location of the sprite data in the sprite sheet.
   * This is in pixels of the sprite sheet [x,y, width, height]
   */
  loc: [number, number, number, number];

  /** offset in pixels to center the sprite on the tile */
  offset?: [number, number];
}
