import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';

/**
 * A cursor used for player selection in menus and dialogs
 */
export class DialogCursor extends Component {
  /** sprite batch that holds the cursor */
  private _spriteController: SpritBatchController;
  /** List of locations in pixels the cursor can be at */
  private _positions: vec2[];
  /** the current position of the cursor */
  private _activePosition: vec2;
  /** the active index */
  private _activeIndex: number;
  /** animation curve */
  protected _cursorCurve: Curve; // used for animations
  private _cursorId: string;
  private _visible: boolean;
  private _depth: number;

  /** On select event */
  private _onSelect: (index: number, cursor: DialogCursor) => void;

  get index() {
    return this._activeIndex;
  }

  get position(): vec2 {
    return this._activePosition;
  }

  set index(value: number) {
    this._activeIndex = value;

  }

  /**
   * Number of positions this cursor can have
   */
  get indexCount() {
    return this._positions.length;
  }

  constructor(eng: Engine) {
    super(eng);
    this._positions = [];
    this._activeIndex = -1;
    this._activePosition = new vec2(0, 0);
    this._cursorCurve = new Curve();
    this._cursorCurve.points([
      {
        p: 0,
        t: 0,
      },
      {
        p: 10,
        t: 500,
      },
      {
        p: 0,
        t: 1000,
      },
    ]);
    this._cursorCurve.curve(CurveType.linear);
    this._cursorCurve.repeat(-1);

    this._visible = false;
  }

  initialize(
    id: string,
    spriteController: SpritBatchController,
    positions: vec2[],
    onSelect?: (index: number, cursor: DialogCursor) => void,
    depth: number = -0.6
  ) {
    this._spriteController = spriteController;
    this._positions = positions;
    this._cursorId = id;
    this._depth = depth;
    this._onSelect = onSelect;
  }

  /**
   * Selects the active index
   */
  select(): void {
    // let the user handle the select change
    if (this._onSelect) {
      this._onSelect(this._activeIndex, this);
    }
  }

  show(index?: number, onSelect?: (index: number, cursor: DialogCursor) => void,) {
    if (index != undefined) {
      this._activeIndex = index;
    }
    this._visible = true;
    if (onSelect) {
      this._onSelect = onSelect;
    }
  }

  /**
   * Cause the cursor to stop moving as the player selected something
   */
  lock() {
    this._cursorCurve.pause(0);
  }

  /**
   * Hide the cursor
   */
  hide() {
    this._visible = false;

    if (this._spriteController) {
      this._spriteController.removeSprite(this._cursorId);
      this._spriteController.commitToBuffer();
    }
  }

  redraw() {
    if (!this._spriteController) {
      return;
    }

    if (this._visible) {
      const position = this._positions[this._activeIndex];
      if (position) {
        this._activePosition = position;
        this._spriteController.activeSprite(this._cursorId);
        this._spriteController.scale(0.9);
        this._spriteController.viewOffset(new vec2(0, 0));
        this._spriteController.viewScale(1.0);
        this._spriteController.setSprite('cursor');
        this._spriteController.setSpritePosition(position.x, this.eng.height - position.y, this._depth);

        this._cursorCurve.start(true, undefined, (val) => {
          this._spriteController.activeSprite(this._cursorId);
          this._spriteController.setSpritePosition(position.x + val, this.eng.height - position.y, this._depth);
        });
      }
    } else {
      this._spriteController.removeSprite(this._cursorId);
      this._spriteController.commitToBuffer();
    }
  }

  /**
   * Updates the animation
   * @param dt
   */
  update(dt: number) {
    this._cursorCurve.update(dt);
    this.redraw();
  }

  dispose(): void {
    this._onSelect = undefined;
  }
}
