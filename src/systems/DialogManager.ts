import { Component } from '../components/Component';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Engine } from '../core/Engine';
import { DialogComponent } from '../menus/DialogComponent';
import { InputState } from '../core/InputState';
import { GameMenuComponent } from '../menus/GameMenuComponent';
import { DialogBuilder } from '../menus/DialogBuilder';
import { GameMenuBuilder } from '../menus/GameMenuBuilder';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';

/**
 * Manages dialog boxes
 */
export class DialogManager extends Component {
  protected _spriteBatch: SpritBatchController;
  protected _dialog: DialogComponent;
  protected _gameMenu: GameMenuComponent;
  protected _dialogBuild: DialogBuilder;
  protected _gameMenuBuilder: GameMenuBuilder;

  /**
   * Get the game menu
   */
  get gameMenu() {
    return this._gameMenu;
  }

  /**
   * Get the dialog menu
   */
  get dialog() {
    return this._dialog;
  }

  constructor(eng: Engine) {
    super(eng);

    this._dialogBuild = new DialogBuilder(eng);
    this._gameMenuBuilder = new GameMenuBuilder(eng);
    this._spriteBatch = new SpritBatchController(eng);
    this._dialog = new DialogComponent(this.eng, this._dialogBuild);
    this._gameMenu = new GameMenuComponent(
      this.eng,
      'gameMenu',
      this._gameMenuBuilder
    );
  }

  async initialize() {
    const texture = this.eng.assetManager.menu.texture;
    const data = this.eng.assetManager.menu.data;
    this._spriteBatch.initialize(texture, data);
    this._dialog.initialize(this._spriteBatch);
    this._gameMenu.initialize(this._spriteBatch);
  }

  /**
   * Handles user actions for the menu
   * @param action
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    return (
      this._dialog.handleUserAction(state) ||
      this._gameMenu.handleUserAction(state)
    );
  }

  /**
   * Shows a dialog box
   * @param text
   * @param loc
   */
  showDialog(
    text: string,
    loc: { x: number; y: number; width: number; height: number },
    onClosed?: (dialog: DialogComponent) => void,
    options?: string[],
    onClosing?: (dialog: DialogComponent) => boolean,
    depth: number = -0.5
  ) {
    this._dialog.setOptions(options);
    this._dialog.setPosition(loc.x, loc.y);
    this._dialog.setSize(loc.width, loc.height);
    this._dialog.setText(text);
    this._dialog.onClosed = onClosed;
    this._dialog.onClosing = onClosing;
    this._dialog.setDepth(depth);
    this._dialog.show();
  }

  showGameMenu(onHide?: (dialog: GameMenuComponent) => boolean) {
    this._gameMenu.onHide = onHide;
    this._gameMenu.show();
  }

  /**
   * Updates the dialog box
   * @param dt
   */
  update(dt: number) {
    this._dialog.update(dt);
    this._gameMenu.update(dt);
    this._spriteBatch.update(dt);
  }
}
