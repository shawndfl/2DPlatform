import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';

export enum CollisionLocation {
  None = 0x0000,
  TopLeft = 0x0001,
  TopRight = 0x0002,
  BottomRight = 0x0004,
  BottomLeft = 0x0008,

  Edge = 0x0010,
  Top = Edge | TopLeft | TopRight,
  Right = Edge | TopRight | BottomRight,
  Bottom = Edge | BottomLeft | BottomRight,
  Left = Edge | TopLeft | BottomLeft,
}

export class Collision2D extends Component {
  private _id: string;
  private _bounds: rect;
  public showCollision: boolean;

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
    this.setBounds(bounds);
  }

  set(left: number, width: number, top: number, height: number): void {
    this._bounds.set(left, width, top, height);
  }

  setPos(left: number, top: number): void {
    this._bounds.set(left, this._bounds.width, top, this._bounds.height);
  }

  public setBounds(bounds?: Readonly<rect>): void {
    this._bounds = bounds.copy() ?? new rect();
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
}
