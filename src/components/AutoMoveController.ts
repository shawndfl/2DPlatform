import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { TileHelper } from '../utilities/TileHelper';
import { Component } from './Component';
import { TileComponent } from './TileComponent';

/**
 * This controller will allow a tile to move to some screen position
 * in pixels over time and raise events when done.
 */
export class AutoMoveController extends Component {
  private _movingToTargetTimer: number;
  private _tileComponent: TileComponent;

  /** the target the character should move to */
  private _moveTarget: vec2;
  private _resetTarget: () => void;
  private _move: (direction: vec2) => void;
  private _done: (target: vec2, timedOut: boolean) => void;

  /** Time out in ms */
  timeOutLimit: number;
  /** Limit in pixels from targe */
  distanceLimit: number;

  /** Where the tile needs to move to */
  get target(): vec2 {
    return this._moveTarget;
  }

  constructor(eng: Engine) {
    super(eng);
    this.timeOutLimit = 3000;
    this.distanceLimit = 20;
  }

  /**
   * Start the move animation
   * @param target  Where you want the tile component to move to
   * @param tileComponent the tile component you want to move
   * @param resetTarget reset function
   * @param move move function called each update
   * @param done when the movement is done or timed out
   */
  startMove(
    target: vec2,
    tileComponent: TileComponent,
    resetTarget: () => void,
    move: (direction: vec2) => void,
    done: (target: vec2, timedOut: boolean) => void
  ) {
    this._resetTarget = resetTarget;
    this._move = move;
    this._done = done;
    this._moveTarget = target;
    this._tileComponent = tileComponent;

    // get the direction of the movement based on the mouse cursor or touch point
    this._movingToTargetTimer = 0;
  }

  /** cancel the move */
  cancelMove() {
    this._moveTarget = undefined;
  }

  /**
   * Update the movement
   * @param dt
   */
  update(dt: number) {
    if (this._moveTarget) {
      // reset direction and walking
      this._resetTarget();

      // increment timer
      this._movingToTargetTimer += dt;

      // get movement direction
      const screenPos = this._tileComponent.screenPosition;
      const pos2 = new vec2(screenPos.xy);
      const direction = this._moveTarget.copy().subtract(pos2);

      // did the player make it to the target or did the time expire
      if (this._movingToTargetTimer < this.timeOutLimit) {
        if (direction.length() > this.distanceLimit) {
          this._move(direction);
        } else {
          // done hit out target
          this._done(this._moveTarget, false);
          this._moveTarget = undefined;
          this._movingToTargetTimer = 0;
        }
      } else {
        // done timed out
        this._done(this._moveTarget, true);
        this._moveTarget = undefined;
        this._movingToTargetTimer = 0;
      }
    }
  }
}
