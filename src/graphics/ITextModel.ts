import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

/**
 * This describes a model data used by a TextController
 */
export interface ITextModel {
  /** The unique id for the block of text */
  id: string;

  /** The text for the FontController */
  text: string;

  /** The xy position float[2] */
  position: vec2;

  /** The RGBA color float[3] */
  color: vec4;

  /** depth from -1 to 1. Used for overlaying text */
  depth: number;

  /** scale of the text. 1.0 is normal size */
  scale: number;
}
