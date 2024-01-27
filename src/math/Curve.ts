import * as MathConst from '../math/constants';

export enum CurveType {
  discreet,
  linear,
}

/**
 * Class used to create an animation.
 */
export class Curve {
  private _points: { p: number; t: number }[];
  private _position: number;
  private _time: number;
  private _running: boolean;
  private _type: CurveType;
  private _reverse: boolean;
  private _pingPong: boolean;
  private _repeat: number;
  private _isDone: boolean;
  public speedScale: number = 1;

  private _onDone: (curve: Curve) => void;
  private _onUpdate: (value: number, curve: Curve) => void;

  isRunning() {
    return this._running;
  }

  onDone(onDone: (curve: Curve) => void): Curve {
    this._onDone = onDone;
    return this;
  }

  onUpdate(onUpdate: (value: number, curve: Curve) => void): Curve {
    this._onUpdate = onUpdate;
    return this;
  }

  getValue(): number {
    return this._position;
  }
  getTime() {
    return this._time;
  }

  isDone(): boolean {
    return this._isDone;
  }

  constructor() {
    this._points = [];
    this._position = 0;
    this._time = 0;
    this._reverse = false;
    this._pingPong = false;
    this._type = CurveType.discreet;
    this._isDone = false;
  }

  start(
    restart?: boolean,
    onDone?: (curve: Curve) => void,
    onUpdate?: (value: number, curve: Curve) => void
  ): Curve {
    if (restart) {
      this._time = 0;
      this._position = 0;
      this._isDone = false;
      if (onDone) {
        this._onDone = onDone;
      }
      if (onUpdate) {
        this._onUpdate = onUpdate;
      }

      // if there are points use them
      if (this._points.length > 0) {
        // handle reverse
        if (this._reverse) {
          this._time = this._points[this._points.length - 1].t;
          this._position = this._points[this._points.length - 1].p;
        } else {
          this._time = this._points[0].t;
          this._position = this._points[0].p;
        }
      }
    }

    this._running = true;
    return this;
  }

  /**
   * Pause the animation and set a custom position if wanted
   * @param position
   * @returns
   */
  pause(position?: number): Curve {
    if (position != undefined) {
      this._position = position;
    }
    this._running = false;
    return this;
  }

  /**
   * Repeat the curve.
   * @param value How many times to repeat. -1 is forever
   * @returns
   */
  repeat(value: number) {
    this._repeat = value;
    return this;
  }

  curve(type: CurveType): Curve {
    this._type = type;
    return this;
  }

  points(points: { p: number; t: number }[]): Curve {
    // make a copy and sort it by time
    this._points = points.slice().sort((a, b) => a.t - b.t);

    return this;
  }

  reverse(reverse: boolean): Curve {
    this._reverse = reverse;
    return this;
  }

  isReverse(): boolean {
    return this._reverse;
  }

  reverseToggle(): Curve {
    this._reverse = !this._reverse;
    return this;
  }

  pingPong(pingPong: boolean): Curve {
    this._pingPong = pingPong;
    return this;
  }

  update(dt: number) {
    // if it is running and not done calculate
    // a new position
    if (this._running && !this._isDone) {
      // update time first.
      if (this._reverse) {
        this._time -= dt * this.speedScale;
      } else {
        this._time += dt * this.speedScale;
      }

      // find the closest point
      const indices = this.findClosetTimeIndices(this._time);

      const isDone =
        (this._reverse && this._time <= 0) ||
        (!this._reverse &&
          this._time >= this._points[this._points.length - 1].t);

      if (isDone) {
        // if there are still more points or are we done
        // set the position. We only have one point
        // so this is easy.
        this._position = this._points[indices[0]].p;

        // handle update
        if (this._onUpdate) {
          this._onUpdate(this._position, this);
        }

        // handle the repeat and ping pong
        if (this._repeat > 0 || this._repeat == -1) {
          // if we are ping ponging
          if (this._pingPong) {
            this._reverse = !this._reverse;
          } else {
            // reset time
            this._time = 0;
          }

          if (this._repeat > 0) {
            this._repeat--;
          }
        } else {
          // we are done. Set flag.
          this._isDone = true;
          this._running = false;

          // raise event as needed
          if (this._onDone) {
            this._onDone(this);
          }
        }

        // no more calculations we hit the last point
        return;
      }

      if (indices[0] < 0 || indices[0] > this._points.length - 1) {
        console.error('noooo');
      }
      let p0 = this._points[indices[0]].p;
      let p1 = this._points[indices[1]].p;

      // calculate the position
      if (this._type == CurveType.linear) {
        const t0 = this._points[indices[0]].t;
        const t1 = this._points[indices[1]].t;
        const t =
          t1 - t0 == 0
            ? t1
            : MathConst.clamp((this._time - t0) / (t1 - t0), 0, 1.0);

        this._position = p0 + t * (p1 - p0);
      } else if (this._type == CurveType.discreet) {
        this._position = p0;
      }

      if (this._onUpdate) {
        this._onUpdate(this._position, this);
      }
    }
  }

  /**
   * Finds the index closest to the given time value.
   * @param time
   * @returns
   */
  private findClosetTimeIndices(time: number): [number, number] {
    let startIndex = 0;
    const clip = this._points;

    let endIndex = clip.length - 1;

    let startTime = clip[startIndex].t;
    let lastTime = clip[endIndex].t;

    // check time bounds
    if (time <= startTime) {
      return [startIndex, startIndex];
    } else if (time >= lastTime) {
      return [endIndex, endIndex];
    }

    while (true) {
      // if the current is the time we are looking for
      // or the startIndex is one less then endIndex
      // then we are done.
      if (time == startTime || startIndex >= endIndex - 1) {
        if (startIndex < endIndex) {
          return [startIndex, startIndex + 1];
        } else {
          return [startIndex, startIndex];
        }
      }

      const midIndex = Math.floor((startIndex + endIndex) / 2.0);
      const midFrame = clip[midIndex].t;
      if (time > midFrame) {
        startIndex = midIndex;
      } else if (time < midFrame) {
        endIndex = midIndex;
      } else {
        // found it in the middle
        if (this._reverse) {
          return [midIndex, midIndex - 1];
        } else {
          return [midIndex, midIndex + 1];
        }
      }
    }
  }
}
