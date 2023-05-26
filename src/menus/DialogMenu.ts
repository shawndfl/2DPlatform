import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ISpriteData } from '../graphics/ISpriteData';
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
    const spriteData: ISpriteData[] = [
      {
        id: 'menu.top.right',
        loc: [0, 0, 7, 7],
      },
      {
        id: 'menu.top.left',
        loc: [16, 0, 7, 7],
      },
      {
        id: 'menu.bottom.left',
        loc: [16, 13, 7, 7],
      },
      {
        id: 'menu.bottom.right',
        loc: [0, 13, 7, 7],
      },
      {
        id: 'menu.bottom',
        loc: [8, 13, 7, 7],
      },
      {
        id: 'menu.right',
        loc: [16, 7, 7, 7],
      },
      {
        id: 'menu.left',
        loc: [0, 7, 7, 7],
      },
      {
        id: 'menu.top',
        loc: [8, 0, 7, 7],
      },
      {
        id: 'menu.cursor',
        loc: [27, 6, 12, 9],
      },
    ];
    const texture = this.eng.assetManager.menu.texture;
    const data = this.eng.assetManager.menu.data;
    this._spriteBatch.initialize(texture, data);
    let step = 0;

    //TODO add the menu parts to the sprite batch

    //this._spriteBatch.setSprite('sprite_' + i, 0);
    //this._spriteBatch.setSpritePosition('sprite_' + i, x, y, 5, 0.5);

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
