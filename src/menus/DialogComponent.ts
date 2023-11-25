import { Engine } from '../core/Engine';
import { Curve, CurveType } from '../math/Curve';
import { DialogBuilder } from './DialogBuilder';
import { PanelComponent } from './PanelComponent';
import { UserAction } from '../core/UserAction';
import { DialogCursor } from './DialogCursor';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { InputState } from '../core/InputState';

/**
 * A dialog component that can be sized and display text in the game.
 * There is also an onHide event to handle user input
 */
export class DialogComponent extends PanelComponent {
  private _expandAnimation: Curve;
  protected _options: string[];
  protected _selectedOption: string;
  protected _selectedIndex: number;
  protected _cursor: DialogCursor;

  onClosing: (dialog: DialogComponent) => boolean;

  onClosed: (dialog: DialogComponent) => void;

  get selectedOption(): string {
    return this._selectedOption;
  }

  get id(): string {
    return this._id;
  }

  get visible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, dialogBuild: DialogBuilder) {
    super(eng, 'dialog1', dialogBuild);
    this._expandAnimation = new Curve();
    this._expandAnimation.curve(CurveType.linear);
    this._expandAnimation.points([
      { t: 0, p: 0 },
      { t: 250, p: 1 },
      { t: 500, p: 2 },
    ]);
    this._cursor = new DialogCursor(eng);
  }

  /**
   * Options are use to allow the user to select something from the dialog box
   * @param options
   */
  setOptions(options: string[]): void {
    this._options = options;
  }

  /**
   * Handle user interaction with the dialog
   * @param state
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    const active = this.visible;
    if (active && state.isReleased(UserAction.A)) {
      let canHide = true;

      if (this.onClosing) {
        canHide = this.onClosing(this);
      }

      this._cursor.select();

      if (canHide) {
        this.hide();

        if (this.onClosed) {
          this.onClosed(this);
        }
      }
    }

    if (this._options?.length > 0) {
      // select next option
      if (state.isReleased(UserAction.Down)) {
        if (this._cursor.index < this._cursor.indexCount - 1) {
          this._cursor.index++;
        } else {
          this._cursor.index = 0;
        }
        this._cursor.select();
      }
      // select previous option
      if (state.isReleased(UserAction.Up)) {
        if (this._cursor.index > 0) {
          this._cursor.index--;
        } else {
          this._cursor.index = this._cursor.indexCount - 1;
        }
        this._cursor.select();
      }
    }
    return active;
  }

  show() {
    super.show();
    if (this._options?.length > 0) {
      this._cursor.show(0);
    }
  }

  hide() {
    super.hide();
    this.eng.textManager.hideText(this.id);
    this._dialogBuild.hideDialog(this.id);
    this._cursor.hide();
    for (let i = 0; i < this._options?.length; i++) {
      this.eng.textManager.hideText(this.id + '_' + this._options[i]);
    }
  }

  redraw() {
    super.redraw();
    if (this.visible) {
      // add the cursor and the positions it can be placed at
      if (this._options?.length > 0) {
        const { width, height } = this.eng.textManager.getTextSize(this._text);

        const optionIndent = 60;
        const optionsHeightPadding = 20;
        let yOffset = height + optionsHeightPadding;
        let optionXPosition = optionIndent + this._pos.x + this._textOffset.x;
        const optionPositions: vec2[] = [];

        // add the text for all the options
        for (let i = 0; i < this._options.length; i++) {
          const option = this._options[i];
          const x = optionXPosition;
          const y = yOffset + this._textOffset.y + this._pos.y;
          const textPos = new vec2(x, y);
          this.eng.textManager.setTextBlock({
            id: this.id + '_' + option,
            text: option,
            position: textPos,
            color: new vec4([0.9, 0.9, 1.0, 1.0]),
            depth: this._depth - 0.01, // set the depth just in front of this dialog box
            scale: 1.0,
          });
          optionPositions.push(new vec2(x - optionIndent, y + this.eng.textManager.lineHeight * 0.5));

          yOffset += this.eng.textManager.lineHeight;
        }

        // update the cursor with the latest options
        this._cursor.initialize(
          this.id + '.cursor',
          this._spriteController,
          optionPositions,
          (index) => {
            this._selectedIndex = index;
            this._selectedOption = this._options ? this._options[this._selectedIndex] : null;
          },
          this._depth - 0.01 // set the depth just in front of this dialog box
        );
        // select will set the _selectedOption to to the activeIndex
        this._cursor.select();
      }
    } else {
      this._cursor.hide();
      for (let i = 0; i < this._options?.length; i++) {
        this.eng.textManager.hideText(this.id + '_' + this._options[i]);
      }
    }
  }

  update(dt: number) {
    super.update(dt);
    this._expandAnimation.update(dt);
    this._cursor.update(dt);
  }
}
