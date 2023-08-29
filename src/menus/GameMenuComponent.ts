import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { Component } from '../core/Component';
import { GameMenuBuilder } from './GameMenuBuilder';
import { InputState } from '../core/InputHandler';
import { UserAction } from '../core/UserAction';
import { DialogCursor } from './DialogCursor';

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
  protected _dirty: boolean;
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
    this._dirty = false;
    this._cursor = new DialogCursor(eng);
  }

  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
    this._dialogBuild.initialize(this._spriteController);

    // menu options positions
    const items = new vec2(30, 540);
    const status = new vec2(30, 480);
    const equip = new vec2(30, 430);
    const map = new vec2(30, 370);
    const save = new vec2(30, 320);

    this._cursor.initialize('cursor.1', this._spriteController, [items, status, equip, map, save], (index) => {
      switch (index) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          this.save();
          console.debug('saved!');
          break;
      }

      console.debug('selecting index ' + index);
    });
  }

  save() {
    this.eng.gameManager.save();
  }

  setPosition(x: number, y: number) {
    this._pos.x = x;
    this._pos.y = y;
    this._dirty = true;
  }

  show() {
    this._visible = true;
    this._dirty = true;
    this._cursor.show(0);
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
    this._dirty = true;
  }

  /**
   * Handle user interaction with the dialog
   * @param state
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    const active = this.visible;
    if (active) {
      if ((state.action & UserAction.MenuPressed) > 0) {
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
      if ((state.action & UserAction.DownPressed) > 0) {
        if (this._cursor.index < this._cursor.indexCount - 1) {
          this._cursor.index++;
        } else {
          this._cursor.index = 0;
        }
      }
      // select previous option
      if ((state.action & UserAction.UpPressed) > 0) {
        if (this._cursor.index > 0) {
          this._cursor.index--;
        } else {
          this._cursor.index = this._cursor.indexCount - 1;
        }
      }

      // accept the option
      if ((state.action & UserAction.ActionPressed) > 0) {
        this._cursor.select();
      }
    }

    return active;
  }

  redraw() {
    if (this.visible) {
      this._dialogBuild.show();

      this._spriteController.commitToBuffer();

      const gold = this.eng.gameManager.data.player.gold.toString();
      this.eng.textManager.setTextBlock({
        id: 'menu.gold',
        text: gold.padStart(7, '0'),
        position: new vec2([90, 370]),
        color: new vec4([0.0, 0.0, 0.0, 1.0]),
        depth: -1,
        scale: 1.0,
      });
    } else {
      this._dialogBuild.hide();
      this._cursor.hide();
      this.eng.textManager.hideText('menu.gold');
      this.eng.textManager.hideText('menu.time');
    }
  }

  update(dt: number) {
    if (this._dirty) {
      this.redraw();
      this._dirty = false;
    }

    // show the time updates
    if (this.visible) {
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

    this._cursor.update(dt);
  }
}
