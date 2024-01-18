import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { DialogBuilder } from './DialogBuilder';
import { IDialogParams } from './IDialogParams';
import { Component } from '../components/Component';

export class PanelComponent extends Component {
  protected _id: string;
  protected _spriteController: SpritBatchController;
  protected _visible: boolean;
  protected _pos: vec2;
  protected _size: vec2;
  protected _text: string;
  protected _textOffset: vec2;
  protected _dirty: boolean;

  /** [1 to -1]    -1 in front of everything 1 behind everything */
  protected _depth: number;

  get id(): string {
    return this._id;
  }

  get visible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, id: string, protected _dialogBuild: DialogBuilder) {
    super(eng);
    this._id = id;
    this._visible = false;
    this._pos = new vec2();
    this._size = new vec2(300, 200);
    this._textOffset = new vec2(50, 60);
    this._dirty = false;
    this._depth = -0.5;
  }

  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
    this._dialogBuild.initialize(this._spriteController);
  }

  setPosition(x: number, y: number) {
    this._pos.x = x;
    this._pos.y = y;
    this._dirty = true;
  }

  /**
   * Range 1 to -1 in screen space
   * @param depth
   */
  setDepth(depth: number) {
    this._depth = depth;
  }

  /**
   * Sets the text for this panel
   * @param text
   */
  setText(text: string) {
    this._text = text;
    this._dirty = true;
  }

  setSize(width: number, height: number) {
    this._size.x = width;
    this._size.y = height;
    this._dirty = true;
  }

  show() {
    this._visible = true;
    this._dirty = true;
  }

  hide() {
    this._visible = false;
    this._dirty = true;
  }

  redraw() {
    if (this.visible) {
      const p: IDialogParams = {
        x: this._pos.x,
        y: this._pos.y,
        width: this._size.x,
        height: this._size.y,
        depth: this._depth,
      };
      this._dialogBuild.buildDialog(this.id, p);

      const textPos = new vec2(
        this._pos.x + this._textOffset.x,
        p.y + this._textOffset.y
      );
      this.eng.textManager.setTextBlock({
        id: this.id,
        text: this._text,
        position: textPos,
        color: new vec4([0.9, 0.9, 1.0, 1.0]),
        depth: this._depth - 0.01,
        scale: 1.0,
      });
    } else {
      this.eng.textManager.hideText(this.id);
      this._dialogBuild.hideDialog(this.id);
    }
  }

  update(dt: number) {
    if (this._dirty) {
      this.redraw();
      this._dirty = false;
    }
  }
}
