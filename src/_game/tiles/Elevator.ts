import { Curve, CurveType } from '../../math/Curve';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';

import { CollisionBox, ICollisionBoxOptions } from './CollisionBox';

export interface IElevatorOptions extends ICollisionBoxOptions {
  offset: vec2;
  msTime: number;
}

/**
 * This is an elevator that can move up and down and side to side
 */
export class Elevator extends CollisionBox {
  startPoint: vec2;
  lastPosition: vec2;
  endPoint: vec2;
  time: number;
  loop: boolean;
  private curves: Curve;

  private attached: Map<string, Collision2D>;

  constructor(eng: PlatformEngine, public options: Readonly<IElevatorOptions>) {
    super(eng, options);

    this.attached = new Map<string, Collision2D>();
    this._requiresUpdate = true;
    this.startPoint = new vec2(options.bounds.left, options.bounds.top);
    this.time = options.msTime;
    this.endPoint = this.startPoint.copy().add(options.offset);
    this.curves = new Curve();
    this.curves.points([
      { p: 0, t: 0 },
      { p: 1, t: this.time },
    ]);
    this.curves.curve(CurveType.linear);
    this.curves.repeat(-1);
    this.curves.pingPong(true);
    this.lastPosition = this.startPoint.copy(this.lastPosition);

    // start the curve and update the position
    this.curves.start(true, undefined, (value) => {
      this.lastPosition.x = this.bounds.left;
      this.lastPosition.y = this.bounds.top;

      const left =
        this.startPoint.x + value * (this.endPoint.x - this.startPoint.x);
      const top =
        this.startPoint.y + value * (this.endPoint.y - this.startPoint.y);
      this.bounds.setPosition(left, top);
      // update the position of the graphic
      this.showCollision = this.options.debug;

      const dx = left - this.lastPosition.x;
      const dy = top - this.lastPosition.y;

      // update the position of all the attached things
      this.attached.forEach((c) => {
        // the attached thing needs to be on the surface of the elevator
        c.setPos(c.bounds.left + dx, c.bounds.top + dy);
      });
      this.attached.clear();
    });
  }

  collisionTriggered(others: Collision2D[]): void {
    super.collisionTriggered(others);
    if (!others) {
      return;
    }

    // attach it
    for (let other of others) {
      if (other.bounds.bottom == this.bounds.top) {
        this.attached.set(other.id, other);
      }
    }
  }

  update(dt: number) {
    this.curves.update(dt);
  }
}
