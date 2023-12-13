import mat2 from './mat2';
import mat3 from './mat3';
import vec3 from './vec3';

import { epsilon } from './constants';

export default class vec2 {
  get x(): number {
    return this.values[0];
  }

  get y(): number {
    return this.values[1];
  }

  get xy(): [number, number] {
    return [this.values[0], this.values[1]];
  }

  set x(value: number) {
    this.values[0] = value;
  }

  set y(value: number) {
    this.values[1] = value;
  }

  set xy(values: [number, number]) {
    this.values[0] = values[0];
    this.values[1] = values[1];
  }

  constructor(values?: [number, number] | number, y?: number) {
    if (values !== undefined) {
      if (typeof values === 'number') {
        this.values[0] = values;
      } else if (Array.isArray(values)) {
        this.xy = values;
      }

      if (y !== undefined) {
        this.values[1] = y;
      }
    }
  }

  values = new Float32Array(2);

  static readonly zero = new vec2([0, 0]);
  static readonly one = new vec2([1, 1]);

  at(index: number): number {
    return this.values[index];
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
  }

  foreach(fn: (val: number) => void): void {
    for (let i = 0; i < this.values.length; i++) {
      fn(this.values[i]);
    }
  }

  copy(dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    dest.x = this.x;
    dest.y = this.y;

    return dest;
  }

  negate(dest?: vec2): vec2 {
    if (!dest) {
      dest = this;
    }

    dest.x = -this.x;
    dest.y = -this.y;

    return dest;
  }

  equals(vector: vec2, threshold = epsilon): boolean {
    if (Math.abs(this.x - vector.x) > threshold) {
      return false;
    }

    if (Math.abs(this.y - vector.y) > threshold) {
      return false;
    }

    return true;
  }

  length(): number {
    return Math.sqrt(this.squaredLength());
  }

  squaredLength(): number {
    const x = this.x;
    const y = this.y;

    return x * x + y * y;
  }

  add(vector: vec2): vec2 {
    this.x += vector.x;
    this.y += vector.y;

    return this;
  }

  subtract(vector: vec2, dest?: vec2): vec2 {
    if (!dest) {
      dest = this;
    }
    dest.x = this.x - vector.x;
    dest.y = this.y - vector.y;

    return dest;
  }

  multiply(vector: vec2): vec2 {
    this.x *= vector.x;
    this.y *= vector.y;

    return this;
  }

  divide(vector: vec2): vec2 {
    this.x /= vector.x;
    this.y /= vector.y;

    return this;
  }

  scale(value: number, dest?: vec2): vec2 {
    if (!dest) {
      dest = this;
    }

    dest.x *= value;
    dest.y *= value;

    return dest;
  }

  normalize(dest?: vec2): vec2 {
    if (!dest) {
      dest = this;
    }

    let length = this.length();

    if (length === 1) {
      return this;
    }

    if (length === 0) {
      dest.x = 0;
      dest.y = 0;

      return dest;
    }

    length = 1.0 / length;

    dest.x *= length;
    dest.y *= length;

    return dest;
  }

  multiplyMat2(matrix: mat2, dest?: vec2): vec2 {
    if (!dest) {
      dest = this;
    }

    return matrix.multiplyVec2(this, dest);
  }

  multiplyMat3(matrix: mat3, dest?: vec2): vec2 {
    if (!dest) {
      dest = this;
    }

    return matrix.multiplyVec2(this, dest);
  }

  static cross(vector: vec2, vector2: vec2, dest?: vec3): vec3 {
    if (!dest) {
      dest = new vec3();
    }

    const x = vector.x;
    const y = vector.y;

    const x2 = vector2.x;
    const y2 = vector2.y;

    const z = x * y2 - y * x2;

    dest.x = 0;
    dest.y = 0;
    dest.z = z;

    return dest;
  }

  static dot(vector: vec2, vector2: vec2): number {
    return vector.x * vector2.x + vector.y * vector2.y;
  }

  static distance(vector: vec2, vector2: vec2): number {
    return Math.sqrt(this.squaredDistance(vector, vector2));
  }

  static squaredDistance(vector: vec2, vector2: vec2): number {
    const x = vector2.x - vector.x;
    const y = vector2.y - vector.y;

    return x * x + y * y;
  }

  static direction(vector: vec2, vector2: vec2, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    const x = vector.x - vector2.x;
    const y = vector.y - vector2.y;

    let length = Math.sqrt(x * x + y * y);

    if (length === 0) {
      dest.x = 0;
      dest.y = 0;

      return dest;
    }

    length = 1 / length;

    dest.x = x * length;
    dest.y = y * length;

    return dest;
  }

  static mix(vector: vec2, vector2: vec2, time: number, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    const x = vector.x;
    const y = vector.y;

    const x2 = vector2.x;
    const y2 = vector2.y;

    dest.x = x + time * (x2 - x);
    dest.y = y + time * (y2 - y);

    return dest;
  }

  static sum(vector: vec2, vector2: vec2, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    dest.x = vector.x + vector2.x;
    dest.y = vector.y + vector2.y;

    return dest;
  }

  static difference(vector: vec2, vector2: vec2, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    dest.x = vector.x - vector2.x;
    dest.y = vector.y - vector2.y;

    return dest;
  }

  static product(vector: vec2, vector2: vec2, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    dest.x = vector.x * vector2.x;
    dest.y = vector.y * vector2.y;

    return dest;
  }

  static quotient(vector: vec2, vector2: vec2, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }

    dest.x = vector.x / vector2.x;
    dest.y = vector.y / vector2.y;

    return dest;
  }

  toString() {
    return this.x.toFixed(5) + ', ' + this.y.toFixed(5);
  }

  /**
   * Where do these two lines intersect.
   * @param p0
   * @param p1
   * @param p2
   * @param p3
   * @param intersectionPoint
   * @returns
   */
  static lineIntersectionLine(
    p0: vec2,
    p1: vec2,
    p2: vec2,
    p3: vec2,
    intersectionPoint?: vec2
  ): vec2 {
    if (!intersectionPoint) {
      intersectionPoint = new vec2();
    }
    // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
    const a = p0.x;
    const b = p0.y;
    const c = p1.x;
    const d = p1.y;
    const p = p2.x;
    const q = p2.y;
    const r = p3.x;
    const s = p3.y;
    const det = (c - a) * (s - q) - (r - p) * (d - b);

    if (det === 0) {
      return null;
    }
    const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    const intersect = 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    if (intersect) {
      intersectionPoint.x = a + (c - a) * lambda;
      intersectionPoint.y = b + (d - b) * lambda;
      return intersectionPoint;
    } else {
      return null;
    }

    /*
    // XNA implementation https://stackoverflow.com/questions/3746274/line-intersection-with-aabb-rectangle
    Vector2 b = a2 - a1;
    Vector2 d = b2 - b1;
    float bDotDPerp = b.X * d.Y - b.Y * d.X;

    // if b dot d == 0, it means the lines are parallel so have infinite intersection points
    if (bDotDPerp == 0)
        return false;

    Vector2 c = b1 - a1;
    float t = (c.X * d.Y - c.Y * d.X) / bDotDPerp;
    if (t < 0 || t > 1)
        return false;

    float u = (c.X * b.Y - c.Y * b.X) / bDotDPerp;
    if (u < 0 || u > 1)
        return false;

    intersection = a1 + t * b;

    return true;
    */
  }
}
