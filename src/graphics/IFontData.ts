/**
 * The data for a font file. This comes from a json file that is created
 * along with the font image.
 */
export interface IFontData {
  /** @type {string} The ascii character */
  ch: string;
  /**  The int value of the ascii character */
  value: number;
  /** Size of the character */
  sizeX: number;
  /** Size of the character */
  sizeY: number;
  /** Offset of the character */
  bearingX: number;
  /** Offset of the character */
  bearingY: number;
  /** Where to draw the next character */
  advance: number;
  /** uv coordinates for the character in the texture */
  u1: number;
  v1: number;
  /** uv coordinates for the character in the texture */
  u2: number;
  v2: number;
}
