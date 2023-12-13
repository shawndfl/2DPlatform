import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { MetersToPixels, PixelsToMeters } from '../systems/PhysicsManager';
import { Collision2D } from './Collision2D';
import { CollisionResults } from './QuadTree';

export class RidgeBody extends Collision2D {
  /** meters */
  public position: vec3;
  /** meters per second ^2 */
  public acceleration: vec3;
  /** meters per second */
  public velocity: vec3;
  public force: vec3;
  public mass: number;
  public active: boolean;

  public maxVelocity: vec3;

  private nextPosition: vec3;
  private nextVelocity: vec3;
  private collisionResults: CollisionResults;

  onPositionChange: (newPosition: Readonly<vec3>) => void;

  constructor(
    eng: Engine,
    id: string,
    tag: Component,
    bounds?: Readonly<rect>
  ) {
    super(eng, id, tag, bounds);
    this.position = new vec3();
    this.velocity = new vec3();
    this.acceleration = new vec3();
    this.maxVelocity = new vec3([1000, 1000, 1000]);
    this.force = new vec3();
    this.mass = 10;
    this.active = true;
  }

  private temp = new vec3();
  update(dt: number) {
    const t = dt * 0.001;
    if (this.active) {
      // get a copy of the position and velocity
      this.nextPosition = this.position.copy(this.nextPosition);
      this.nextVelocity = this.velocity.copy(this.nextVelocity);

      // apply acceleration and velocity
      const adjustAcc = this.acceleration
        .copy()
        .add(this.eng.physicsManager.gravity);

      this.nextVelocity.add(adjustAcc.scale(t, this.temp));
      this.nextPosition.add(this.nextVelocity.scale(t, this.temp));

      let colliding = false;
      // check collision
      // adjust position, acceleration, velocity
      if (this.collisionCorrection()) {
        this.acceleration.reset();
        colliding = true;
      }

      // update position and velocity
      this.nextPosition.copy(this.position);
      this.nextVelocity.copy(this.velocity);
      this.bounds.setPosition(
        this.nextPosition.x * MetersToPixels,
        this.nextPosition.y * MetersToPixels + this.bounds.height
      );

      if (colliding) {
        this.eng.annotationManager.buildRect(
          this.id + '_collision',
          this.bounds,
          new vec4([1, 0, 0, 1])
        );
      } else {
        this.eng.annotationManager.buildRect(
          this.id + '_collision',
          this.bounds,
          new vec4([0, 1, 0, 1])
        );
      }

      if (this.onPositionChange) {
        this.onPositionChange(this.nextPosition);
      }
    }
  }

  /**
   * Checks for a collision and corrects the nextPosition.
   * @param position
   * @param nextPosition
   * @returns true if there is a collision and false otherwise
   */
  collisionCorrection(): boolean {
    // clear old collision
    if (this.collisionResults) {
      this.collisionResults.collisions.forEach((c) => {
        this.eng.annotationManager.removeRect(c.id);
      });
      this.collisionResults.collisions = [];
      this.collisionResults.correctionVector.x = 0;
      this.collisionResults.correctionVector.y = 0;
    }

    this.bounds.setPosition(
      this.nextPosition.x * MetersToPixels,
      this.nextPosition.y * MetersToPixels + this.bounds.height
    );

    // check for collisions
    this.collisionResults = this.eng.physicsManager.checkForCollision(
      this,
      this.collisionResults
    );

    const correction = this.collisionResolution();
    this.nextPosition.x += correction.x * PixelsToMeters;
    this.nextPosition.y += correction.y * PixelsToMeters;

    // adjust the velocity
    //const scale = vec2.dot(
    //  correction.normalize(),
    //  new vec2(this.nextVelocity.x, this.nextVelocity.y).normalize()
    //);
    //this.nextVelocity.x += this.velocity.x * scale;
    //this.nextVelocity.y += this.velocity.y * scale;
    if (this.collisionResults.collisions.length > 0) {
      if (correction.x != 0) {
        this.nextVelocity.x = 0;
      }
      if (correction.y != 0) {
        this.nextVelocity.y = 0;
      }
    }

    // draw base line
    const height = 0;
    this.eng.annotationManager.buildLine({
      start: new vec2(0, height),
      end: new vec2(1000, height),
      color: new vec4([1, 0, 0, 1]),
      id: 'baseline',
    });

    // safety net
    if (this.nextPosition.y <= height) {
      this.nextPosition.y = height;
      this.nextVelocity.reset();
      return true;
    }
    return this.collisionResults.collisions.length > 0;
  }

  /**
   * Calculate a correction vector
   * @returns
   */
  collisionResolution(): vec2 {
    const adjustment = this.collisionResults.correctionVector;
    adjustment.reset();
    const adjustmentScale = 0.05;
    const maxRuns = 7;

    for (let counter = 0; counter < maxRuns; counter++) {
      for (let i = 0; i < this.collisionResults.collisions.length; i++) {
        const c = this.collisionResults.collisions[i];
        const other = c.bounds;
        const mine = this.bounds;

        // show collisions
        this.eng.annotationManager.buildRect(
          c.id,
          other,
          new vec4([1, 0, 0, 1])
        );

        // this collision is overlapping on the top of the other.
        if (
          mine.top > other.top &&
          other.top > mine.bottom &&
          other.bottom < mine.bottom
        ) {
          const offset = other.top - mine.bottom;
          adjustment.y += offset * adjustmentScale;
          this.nextVelocity.y = 0;
        }
        // this collision is overlapping on the bottom of the other.
        else if (
          mine.bottom < other.bottom &&
          mine.top > other.bottom &&
          mine.top < other.bottom
        ) {
          const offset = mine.top - other.bottom;
          adjustment.y -= offset * adjustmentScale;
          this.nextVelocity.y = 0;
        }

        // this collision is overlapping on the left of the other
        else if (
          mine.left < other.left &&
          other.left < mine.right &&
          other.right > mine.right
        ) {
          const offset = mine.right - other.left;
          adjustment.x -= offset * adjustmentScale;
          this.nextVelocity.y = 0;
        }
        // this collision is overlapping on the right of the other
        else if (
          mine.right > other.right &&
          other.right > mine.left &&
          other.left < mine.left
        ) {
          const offset = other.right - mine.left;
          adjustment.x += offset * adjustmentScale;
          this.nextVelocity.y = 0;
        }
      }
    }

    return adjustment;
  }
}
