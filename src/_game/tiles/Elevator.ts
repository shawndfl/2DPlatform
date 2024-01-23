import { Curve, CurveType } from '../../math/Curve';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';

import { ICollision } from '../data/ILevelData2';

export interface IElevatorOptions {
  id: string;
  debug: boolean;
  color: vec4;
  bounds: rect;

  offset: vec2;
  msTime: number;
}

/**
 * This is an elevator that can move up and down and side to side
 */
export class Elevator extends Collision2D {
  startPoint: vec2;
  lastPosition: vec2;
  endPoint: vec2;
  time: number;
  loop: boolean;
  private curves: Curve;

  private attached: Map<string, Collision2D>;

  constructor(eng: PlatformEngine, public options: Readonly<IElevatorOptions>) {
    super(eng, options.id ?? eng.random.getUuid(), null, options.bounds);

    this._debugColor = options.color;
    this.showCollision = options.debug;

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
        c.bounds.setPosition(c.bounds.left + dx, c.bounds.top + dy);
      });
    });

    this.eng.physicsManager.setCollision(this);
  }

  collisionTriggered(other: Collision2D): void {
    super.collisionTriggered(other);
    if (!other) {
      return;
    }

    // attach it
    if (other.bounds.bottom == this.bounds.top) {
      this.attached.set(other.id, other);
    }
    //if (other.bounds.top > this.bounds.top && other.bounds.edgeOverlapX) {
    //  const top = this.bounds.top + other.bounds.height;
    //  other.setPos(other.bounds.left, top);
    //}
  }

  update(dt: number) {
    this.curves.update(dt);
  }
}
