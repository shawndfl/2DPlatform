import { Line } from '../../data/Line';

export interface ILevelData {
  /**
   * The scene component that uses this data.
   */
  controllerType: string;

  /**
   * The filename of the sprite sheet.
   */
  spriteSheet: string;

  /**
   * These are cell types that are used by the Ground class
   * to make interesting levels. These tiles types will map to a sprite sheet.
   * format:
   *     tileType | name | other parameters
   */
  tiles: string[];

  /**
   * The index returned by the cells is offset by 10 to make it easier to align number in the json.
   * The array is height, column, row and the value is an index into tiles.
   */
  encode: string[][];
}
