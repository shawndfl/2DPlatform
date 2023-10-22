import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { UserAction } from '../core/UserAction';
import { SpritBatchController } from '../graphics/SpriteBatchController';

/**
 * Test sprite batch vs normal sprites
 */
export class DialogMenu extends Component {
  private _spriteBatch: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);

    this._spriteBatch = new SpritBatchController(eng);
  }

  /**
   * Simulate some menu data
   */
  async initialize() {
    const texture = this.eng.assetManager.menu.texture;
    const data = this.eng.assetManager.menu.data;
    this._spriteBatch.initialize(texture, data);
    let step = 0;
    this._spriteBatch.commitToBuffer();
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(action: UserAction): boolean {
    return false;
  }

  /**
   * Renders the sprites or sprite batches
   * @param dt
   */
  update(dt: number) {
    this._spriteBatch.update(dt);
  }
}
