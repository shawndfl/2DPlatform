import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';
import vec4 from '../math/vec4';

export class Collision2D extends Component {
  private _id: string;
  private _bounds: rect;
  private _showCollision: boolean;
  protected _debugColor: vec4 = new vec4(0, 1, 0, 1);

  public get debugColor(): Readonly<vec4> {
    return this._debugColor;
  }

  public get showCollision(): boolean {
    return this._showCollision;
  }

  public set showCollision(value: boolean) {
    this._showCollision = value;
    if (this._showCollision) {
      this.eng.annotationManager.buildRect(
        this.id + '_collision',
        this.bounds,
        this._debugColor,
        0.4
      );
    } else {
      this.eng.annotationManager.removeRect(this.id + '_collision');
    }
  }

  /**
   * The component this is attached to
   */
  public get tag(): Component {
    return this._tag;
  }

  public get bounds(): Readonly<rect> {
    return this._bounds;
  }

  public get id(): string {
    return this._id;
  }

  constructor(
    eng: Engine,
    id: string,
    private _tag: Component,
    bounds?: Readonly<rect>
  ) {
    super(eng);
    this._id = id;
    this.setBounds(bounds ?? new rect());
  }

  setId(id: string): void {
    this._id = id;
  }

  set(left: number, width: number, top: number, height: number): void {
    this._bounds.set(left, width, top, height);
  }

  setPos(left: number, top: number): void {
    this._bounds.set(left, this._bounds.width, top, this._bounds.height);
  }

  public setBounds(bounds?: Readonly<rect>): void {
    this._bounds = bounds?.copy() ?? new rect();
  }

  /**
   * Used for bounds checking in quad trees
   * @param other
   * @returns
   */
  public isCollidingRect(other: Readonly<rect>): boolean {
    return this._bounds.intersects(other);
  }

  /**
   * Check collision with other colliders
   * @param other
   * @returns
   */
  public isColliding(other: Collision2D): boolean {
    return this._bounds.intersects(other.bounds);
  }
  /*
  public getReflectionVector(
    other: Collision2D,
    previousPosition: Readonly<vec2>
  ): vec2 {
    const center = new vec3(other.bounds.centerX, other.bounds.centerY);
    const toMe = previousPosition.copy().subtract(center);

    // points clock-wise from top left
    const p0 = new vec2(other.bounds.left, other.bounds.top);
    const p1 = new vec2(other.bounds.right, other.bounds.top);
    const p2 = new vec2(other.bounds.right, other.bounds.bottom);
    const p3 = new vec2(other.bounds.left, other.bounds.bottom);

    const l0 = p0.subtract()
  }
*/
  update(dt: number): void {}
}
