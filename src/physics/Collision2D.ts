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

  onCollision: (other: Collision2D) => void;
  onPosition: (left: number, top: number, collision: Collision2D) => void;

  public get left(): number {
    return this._bounds.left;
  }

  public get top(): number {
    return this._bounds.top;
  }

  public get requireUpdate(): boolean {
    return this._requiresUpdate;
  }

  public getMetaHelp(): string[] {
    return null;
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

    if (this.onPosition) {
      this.onPosition(this.bounds.left, this.bounds.top, this);
    }
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

  /**
   * Used by derived classes to handle when something
   * is colliding with this. This could
   * @param other
   */
  collisionTriggered(other: Collision2D): void {
    if (this.onCollision) {
      this.onCollision(other);
    }
  }

  update(dt: number): void {}
}
