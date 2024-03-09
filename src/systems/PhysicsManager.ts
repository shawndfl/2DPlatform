import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';
import vec3 from '../math/vec3';
import { Collision2D } from '../physics/Collision2D';
import {
  CollisionResults,
  QuadTree,
  QuadTreeAnalytics,
} from '../physics/QuadTree';
import { RidgeBody } from '../physics/RidgeBody';

/**
 * How many pixels in a meter
 */
export const MetersToPixels = 70 / 0.25; // 70 pixels ~ 4.5 ft
export const PixelsToMeters = 1 / MetersToPixels;

/**
 * Holds forces
 */
export class PhysicsManager extends Component {
  public gravity: vec3;
  public wind: vec3;
  public quadTree: QuadTree;
  private _bounds: rect;
  protected ridgeBodies: RidgeBody[];
  protected collisions: Collision2D[];

  public get bounds(): Readonly<rect> {
    return this._bounds;
  }

  constructor(eng: Engine) {
    super(eng);
    this.reset();
  }

  reset(): void {
    this.gravity = new vec3([0, -9.8, 0]);
    this.wind = new vec3();
    this._bounds = new rect([0, 10000, 2000, 2000]);
    this.quadTree = new QuadTree(10000, 5);
    this.ridgeBodies = [];
    this.collisions = [];
  }

  initializeBounds(
    width: number,
    height: number,
    quadTreeDepth: number = 5
  ): void {
    const size = Math.max(width, height);
    this._bounds = new rect([0, width, height, height]);
    this.quadTree = new QuadTree(size, quadTreeDepth);
  }

  initialize(): void {}

  setCollision(collision: Collision2D): void {
    this.collisions.push(collision);
    this.quadTree.addCollision(collision);
  }

  getCollision(): Collision2D[] {
    return this.collisions;
  }

  addBody(body: RidgeBody): void {
    this.collisions.push(body);
    this.ridgeBodies.push(body);
  }

  removeBody(body: RidgeBody): void {
    this.ridgeBodies = this.ridgeBodies.filter((r) => r.id != body.id);
    this.collisions = this.collisions.filter((c) => c.id != body.id);
    body.showCollision = false;
  }

  update(dt: number): void {
    for (let i = 0; i < this.ridgeBodies.length; i++) {
      this.ridgeBodies[i].update(dt);
    }
  }

  /**
   * Check for collision
   * @param collision
   * @param results
   * @param analytics
   * @returns
   */
  checkForCollision(
    collision: Collision2D,
    results?: CollisionResults,
    analytics?: QuadTreeAnalytics
  ): CollisionResults {
    return this.quadTree.checkForCollision(collision, results, analytics);
  }
}
