import vec2 from '../math/vec2';
import { TouchSurfaceData } from './TouchSurfaceData';

/**
 * Touch event that is pass through the hit test
 */
export class TouchSurfaceEvent {
  hitSurfaces: TouchSurfaceData[];

  get touchPoint(): vec2 {
    return this._touch;
  }

  constructor(private _touch: vec2) {
    this.hitSurfaces = [];
  }
}
