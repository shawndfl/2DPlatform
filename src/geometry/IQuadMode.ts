import mat2 from '../math/mat2';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';

/**
 * This is the model data that represents a quad
 */
export interface IQuadModel {
  /** scale and rotation */
  rotScale: mat2;

  /**
   * Applied before the rotation and scale.
   * 0,0 is the center of the quad.
   * min (-1,-1) max(1,1)
   * To offset to bottom left corner offset(1,1)
   * To offset to top center offset (0, -1)
   */
  offset: vec2;

  /** Applied after rotation and scale */
  translation: vec3;

  /** Scalar for the final color */
  color: vec4;

  /** min texture (u,v) in uv space -1 to 1 */
  minTex: vec2;

  /** max texture (u,v) in uv space -1 to 1 */
  maxTex: vec2;
}
