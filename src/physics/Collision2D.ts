import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';
import vec4 from '../math/vec4';

export class Collision2D extends Component {
  protected _requiresUpdate: boolean;
  private _id: string;
  private _bounds: rect;
  private _showCollision: boolean;
  protected _debugColor: vec4 = new vec4(0, 1, 0, 1);
  public active: boolean = true;

  /**
   * What collisionType can this collide with.
   */
  collideMask: number = 0xffffff;

  /**
   * This type must match the collision mask of the other
   * collider for the collision to be tested.
   */
  collisionType: number = 0x000001;

  onCollision: (others: Collision2D[]) => void;
  onPosition: (left: number, top: number, collision: Collision2D) => void;

  public get left(): number {
    return this._bounds.left;
  }

  public get top(): number {
    return this._bounds.top;
  }

  public get bottom(): number {
    return this._bounds.bottom;
  }

  public get right(): number {
    return this._bounds.right;
  }

  public get width(): number {
    return this._bounds.width;
  }

  public get height(): number {
    return this._bounds.height;
  }

  public get requireUpdate(): boolean {
    return this._requiresUpdate;
  }

  public get debugColor(): Readonly<vec4> {
    return this._debugColor;
  }

  public get showCollision(): boolean {
    return this._showCollision;
  }

  public set showCollision(value: boolean) {
    this._showCollision = value;
    if (this._showCollision) {
      this.eng.annotationManager.buildRect(this.id + '_collision', this.bounds, this._debugColor, 0.4);
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

  constructor(eng: Engine, id: string, private _tag: Component, bounds?: Readonly<rect>) {
    super(eng);
    this._id = id;
    this._bounds = bounds ? bounds.copy() : new rect();
  }

  setId(id: string): void {
    this._id = id;
  }

  setSize(width: number, height: number): void {
    this._bounds.width = width;
    this._bounds.height = height;
  }

  set(left: number, width: number, top: number, height: number): void {
    this._bounds.width = width;
    this._bounds.height = height;
    this.setPos(left, top);
  }

  setPos(left: number, top: number): void {
    this._bounds.set(left, this._bounds.width, top, this._bounds.height);

    // refresh collision position
    this.showCollision = this.showCollision;

    if (this.onPosition) {
      this.onPosition(this.bounds.left, this.bounds.top, this);
    }
  }

  public setBounds(bounds?: Readonly<rect>): void {
    if (!this._bounds) {
      this._bounds = new rect();
    }
    if (bounds) {
      this.set(bounds.left, bounds.width, bounds.top, bounds.height);
    }
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

  /**
   * Used by derived classes to handle when something
   * is colliding with this. This could
   * @param other
   */
  collisionTriggered(others: Collision2D[]): void {
    if (this.onCollision) {
      this.onCollision(others);
    }
  }

  update(dt: number): void {}
}
