import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { Component } from '../components/Component';
import { GameMenuBuilder } from './GameMenuBuilder';
import { UserAction } from '../core/UserAction';
import { DialogCursor } from './DialogCursor';
import { InputState } from '../core/InputState';

/**
 * The game menu. The player can equip, use items and see stats
 */
export class GameMenuComponent extends Component {
  protected _id: string;
  protected _spriteController: SpritBatchController;
  protected _visible: boolean;
  protected _pos: vec2;
  protected _size: vec2;
  protected _text: string;
  protected _textOffset: vec2;
  protected _cursor: DialogCursor;

  private _formattedTime: string;

  onHide: (dialog: GameMenuComponent) => boolean;

  get id(): string {
    return this._id;
  }

  get visible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, id: string, protected _dialogBuild: GameMenuBuilder) {
    super(eng);
    this._id = id;
    this._visible = false;
    this._pos = new vec2();
    this._size = new vec2(300, 200);
    this._textOffset = new vec2(50, 60);
    this._cursor = new DialogCursor(eng);
  }

  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
    this._dialogBuild.initialize(this._spriteController);

    // menu options positions
    const items = new vec2(30, 70);
    const status = new vec2(30, 120);
    const map = new vec2(30, 180);
    const config = new vec2(30, 240);
    const save = new vec2(30, 290);

    this._cursor.initialize('cursor.1', this._spriteController, [items, status, map, config, save]);
  }

  showEditor() {
    //this.eng.showEditor();
  }

  save() {
    this.eng.gameManager.save();
  }

  setPosition(x: number, y: number) {
    this._pos.x = x;
    this._pos.y = y;
  }

  show() {
    this._visible = true;
    this._cursor.show(0, (index) => {
      switch (index) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          break;
        case 3:
          this.showEditor();
          break;
        case 4:
          this.save();
          console.debug('saved!');
          break;
      }

      console.debug('selecting index ' + index);
    });
  }

  getFormattedTime(): string {
    const t = this.eng.gameManager.data.player.timePlayed;
    let time = t.h.toString().padStart(2, '0');
    time += ':' + t.m.toString().padStart(2, '0');
    time += ':' + t.s.toString().padStart(2, '0');
    return time;
  }

  hide() {
    this._visible = false;
    this._dialogBuild.hide();
    this._cursor.hide();
    this.eng.textManager.hideText('menu.gold');
    this.eng.textManager.hideText('menu.time');
  }

  /**
   * Handle user interaction with the dialog
   * @param state
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    const active = this.visible;
    if (active) {
      if (state.isReleased(UserAction.Start)) {
        let canHide = true;

        // if there is an onHide event fire that
        if (this.onHide) {
          canHide = this.onHide(this);
        }

        if (canHide) {
          this.hide();
        }
      }

      // select next option
      if (state.isReleased(UserAction.Down)) {
        if (this._cursor.index < this._cursor.indexCount - 1) {
          this._cursor.index++;
        } else {
          this._cursor.index = 0;
        }
      }
      // select previous option
      if (state.isReleased(UserAction.Up)) {
        if (this._cursor.index > 0) {
          this._cursor.index--;
        } else {
          this._cursor.index = this._cursor.indexCount - 1;
        }
      }

      // accept the option
      if (state.isReleased(UserAction.A)) {
        this._cursor.select();
      }
    }

    return active;
  }

  redraw() {

    this._dialogBuild.show();

    const gold = this.eng.gameManager.data.player.gold.toString();
    this.eng.textManager.setTextBlock({
      id: 'menu.gold',
      text: gold.padStart(7, '0'),
      position: new vec2([90, 370]),
      color: new vec4([0.0, 0.0, 0.0, 1.0]),
      depth: -1,
      scale: 1.0,
    });

    if (this._formattedTime != this.getFormattedTime()) {
      this._formattedTime = this.getFormattedTime();
      this.eng.textManager.setTextBlock({
        id: 'menu.time',
        text: this._formattedTime,
        position: new vec2([90, 430]),
        color: new vec4([0.0, 0.0, 0.0, 1.0]),
        depth: -1,
        scale: 1.0,
      });

    }
  }

  update(dt: number) {

    // show the time updates
    if (this.visible) {
      this.redraw();
    }
    this._cursor.update(dt);
  }
}
