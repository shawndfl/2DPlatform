import { Engine } from '../core/Engine';
import { Curve, CurveType } from '../math/Curve';
import { DialogBuilder } from './DialogBuilder';
import { PanelComponent } from './PanelComponent';
import { InputState } from '../core/InputHandler';
import { UserAction } from '../core/UserAction';

/**
 * A dialog component that can be sized and display text in the game.
 * There is also an onHide event to handle user input
 */
export class DialogComponent extends PanelComponent {
  private _ready: boolean;
  private _expandAnimation: Curve;

  onHide: (dialog: DialogComponent) => boolean;

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
  }

  /**
   * Handle user interaction with the dialog
   * @param state
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    const active = this.visible;
    if (active && (state.action & UserAction.ActionPressed) > 0) {
      let canHide = true;

      // if there is an onHide event fire that
      if (this.onHide) {
        canHide = this.onHide(this);
      }

      if (canHide) {
        this.hide();
      }
    }

    return active;
  }

  show() {
    super.show();
  }

  hide() {
    super.hide();
  }

  update(dt: number) {
    super.update(dt);
    this._expandAnimation.update(dt);
  }
}
