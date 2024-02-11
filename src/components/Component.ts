import { Engine } from '../core/Engine';

/**
 * A component is something that is part of the game engine and has a reference
 * to the game engine and all the subsystems like text managers, collision and raise events.
 */
export class Component {
  /**
   * Give components easier access to gl
   */
  get gl(): WebGL2RenderingContext {
    return this.eng.gl;
  }

  get eng(): Engine {
    return this._eng;
  }

  constructor(private readonly _eng: Engine) {}
}
