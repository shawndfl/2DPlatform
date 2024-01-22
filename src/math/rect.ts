import { epsilon } from './constants';
import vec2 from './vec2';

/**
 * The bottom left is 0,0
 */
export default class rect {
  /**
   * Used in some calculations
   */
  private static vec2Temp: [vec2, vec2, vec2, vec2] = [
    new vec2(),
    new vec2(),
    new vec2(),
    new vec2(),
  ];

  get centerX(): number {
    return this.left + this.width * 0.5;
  }

  get centerY(): number {
    return this.top + this.height * 0.5;
  }

  get left(): number {
    return this.values[0];
  }

  get width(): number {
    return this.values[1];
  }

  get top(): number {
    return this.values[2];
  }

  get height(): number {
    return this.values[3];
  }

  get right(): number {
    return this.left + this.width;
  }

  get bottom(): number {
    return this.top - this.height;
  }

  set left(value: number) {
    this.values[0] = value;
  }

  set width(value: number) {
    this.values[1] = Math.max(value, 0);
  }

  set top(value: number) {
    this.values[2] = value;
  }

  set height(value: number) {
    this.values[3] = Math.max(value, 0);
  }

  /**
   * Left, width, top, height
   * @param values
   */
  constructor(values?: [number, number, number, number]) {
    if (values !== undefined) {
      this.set(values[0], values[1], values[2], values[3]);
    }
  }

  private values = new Float32Array(4);

  at(index: number): number {
    return this.values[index];
  }

  setPosition(left: number, top: number): void {
    this.values[0] = left;
    this.values[2] = top;
  }

  set(left: number, width: number, top: number, height: number): void {
    this.values[0] = left;
    this.values[1] = Math.max(width, 0);
    this.values[2] = top;
    this.values[3] = Math.max(height, 0);
  }

  reset(): void {
    this.values[0] = 0;
    this.values[1] = 0;
    this.values[2] = 0;
    this.values[3] = 0;
  }

  copy(dest?: rect): rect {
    if (!dest) {
      dest = new rect();
    }

    dest.left = this.left;
    dest.width = this.width;
    dest.top = this.top;
    dest.height = this.height;

    return dest;
  }

  pointInside(x: number, y: number): boolean {
    if (x > this.left && x < this.right) {
      if (y < this.top && y > this.bottom) {
        return true;
      }
    }
    return false;
  }

  /**
   * How much does the other rect overlap this rect on our left edge.
   * @param other
   * @returns the offset that can be added to this.left to fix the overlap.
   */
  edgeOverlapX(other: Readonly<rect>, includeEdges?: boolean): boolean {
    const b1 = this;
    const b2 = other;

    if (includeEdges) {
      if (b1.left <= b2.left && b2.left <= b1.right) {
        return true;
      } else if (b2.left <= b1.left && b1.left <= b2.right) {
        return true;
      }
    } else {
      if (b1.left < b2.left && b2.left < b1.right) {
        return true;
      } else if (b2.left < b1.left && b1.left < b2.right) {
        return true;
      }
    }
    return false;
  }

  /**
   * How much does the other rect overlap this rect on our top or bottom edge.
   * @param other
   * @returns The value that can be added to this.top to correct the overlap
   */
  edgeOverlapY(other: Readonly<rect>, includeEdges?: boolean): boolean {
    const b1 = this;
    const b2 = other;

    if (includeEdges) {
      if (b1.top >= b2.top && b1.bottom <= b2.top) {
        return true;
      } else if (b2.top >= b1.top && b2.bottom <= b1.top) {
        return true;
      }
    } else {
      if (b1.top > b2.top && b1.bottom < b2.top) {
        return true;
      } else if (b2.top > b1.top && b2.bottom < b1.top) {
        return true;
      }
    }
    return false;
  }

  intersects(other: Readonly<rect>): boolean {
    if (this.right > other.left && this.left < other.right) {
      if (this.top > other.bottom && this.bottom < other.top) {
        return true;
      }
    }

    return false;
  }

  encapsulates(other: Readonly<rect>): boolean {
    if (this.left <= other.left && this.right >= other.right) {
      if (this.top >= other.top && this.bottom <= other.bottom) {
        return true;
      }
    }

    return false;
  }

  intersectionPoint(start: vec2, end: vec2): vec2 {
    const topLeft = new vec2(this.left, this.top);
    const topRight = new vec2(this.right, this.top);
    const bottomLeft = new vec2(this.left, this.bottom);
    const bottomRight = new vec2(this.right, this.bottom);

    // left
    let point = vec2.lineIntersectionLine(start, end, topLeft, bottomLeft);
    if (point) {
      return point;
    }

    //top
    point = vec2.lineIntersectionLine(start, end, topLeft, topRight);
    if (point) {
      return point;
    }

    //bottom
    point = vec2.lineIntersectionLine(start, end, bottomLeft, bottomRight);
    if (point) {
      return point;
    }

    // right
    point = vec2.lineIntersectionLine(start, end, topRight, bottomRight);
    if (point) {
      return point;
    }

    return null;
  }

  equals(vector: rect, threshold = epsilon): boolean {
    if (Math.abs(this.left - vector.left) > threshold) {
      return false;
    }

    if (Math.abs(this.width - vector.width) > threshold) {
      return false;
    }

    if (Math.abs(this.top - vector.top) > threshold) {
      return false;
    }

    if (Math.abs(this.height - vector.height) > threshold) {
      return false;
    }

    return true;
  }

  toString() {
    return (
      '[' +
      this.left.toFixed(5) +
      ', ' +
      this.top.toFixed(5) +
      '] (' +
      this.width.toFixed(5) +
      ' X ' +
      this.height.toFixed(5) +
      ')'
    );
  }
}
