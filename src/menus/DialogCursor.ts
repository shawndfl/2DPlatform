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
  private _dirty: boolean;
  private _cursorId: string;
  private _visible: boolean;

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
    this._dirty = true;

    // let the user handle the select change
    if (this._onSelect) {
      this._onSelect(this._activeIndex, this);
    }
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
    this._dirty = true;
    this._visible = false;
  }

  initialize(
    id: string,
    spriteController: SpritBatchController,
    positions: vec2[],
    onSelect?: (index: number, cursor: DialogCursor) => void
  ) {
    this._spriteController = spriteController;
    this._positions = positions;
    this._cursorId = id;
    this._onSelect = onSelect;
  }

  show(index?: number) {
    if (index != undefined) {
      this._activeIndex = index;
    }
    this._visible = true;
    this._dirty = true;
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
    this._dirty = true;
  }

  redraw() {
    if (this._visible) {
      const position = this._positions[this._activeIndex];
      if (position) {
        this._activePosition = position;
        this._spriteController.activeSprite(this._cursorId);
        this._spriteController.scale(0.9);
        this._spriteController.viewOffset(new vec2(0, 0));
        this._spriteController.viewScale(1.0);
        this._spriteController.setSprite('cursor');
        this._spriteController.setSpritePosition(position.x, position.y, -0.3);

        this._cursorCurve.start(true, undefined, (val) => {
          this._spriteController.activeSprite(this._cursorId);
          this._spriteController.setSpritePosition(position.x + val, position.y, -0.3);
        });
      }
    } else {
      this._spriteController.removeSprite(this._cursorId);
    }
  }

  /**
   * Updates the animation
   * @param dt
   */
  update(dt: number) {
    this._cursorCurve.update(dt);

    if (this._dirty) {
      this.redraw();
      this._dirty = false;
    }
  }
}
