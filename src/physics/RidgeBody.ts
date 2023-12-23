import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { MetersToPixels, PixelsToMeters } from '../systems/PhysicsManager';
import { Collision2D, CollisionLocation } from './Collision2D';
import { CollisionResults } from './QuadTree';
import { RectUtilities } from './RectUtilities';

export class RidgeBody extends Collision2D {
  /** meters */
  public position: vec3;
  /** meters per second ^2 */
  public acceleration: vec3;
  /** meters per second */
  public velocity: vec3;
  public instanceVelocity: vec3;
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
    this.instanceVelocity = new vec3();
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
      this.nextPosition.add(this.instanceVelocity.scale(t, this.temp));

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
      //this.bounds.setPosition(
      //  this.nextPosition.x * MetersToPixels,
      //  this.nextPosition.y * MetersToPixels + this.bounds.height
      //);

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
   * Checks all collisions that are overlapping this one and adjusts the nextPosition, nextVelocity, and instanceVelocity.
   * @param position
   * @param nextPosition
   * @returns true if there is a collision and false otherwise
   */
  collisionCorrection(): boolean {
    // clear old collision
    if (this.collisionResults) {
      // removing highlights
      this.collisionResults.collisions.forEach((c) => {
        this.eng.annotationManager.removeRect(c.id);
      });
      // reset collisions
      this.collisionResults.collisions = [];
      this.collisionResults.correctionVector.x = 0;
      this.collisionResults.correctionVector.y = 0;
    }

    // the bounds are used for collision detection
    // make sure they are up to date.
    this.bounds.setPosition(
      this.nextPosition.x * MetersToPixels,
      this.nextPosition.y * MetersToPixels + this.bounds.height
    );

    this.collisionResolution2();

    // set the new position
    this.nextPosition.x = this.bounds.left * PixelsToMeters;
    this.nextPosition.y =
      (this.bounds.top - this.bounds.height) * PixelsToMeters;

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
      this.nextVelocity.y = 0;
      this.instanceVelocity.y = 0;
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
        }
        // this collision is overlapping on the bottom of the other.
        else if (
          mine.bottom < other.bottom &&
          mine.top > other.bottom &&
          mine.top < other.bottom
        ) {
          const offset = mine.top - other.bottom;
          adjustment.y -= offset * adjustmentScale;
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

  collisionResolution2(): void {
    const step = 0.5;
    const simCount = 4;
    const myRect = this.bounds;
    // the min step height before an edge will cause velocity to stop
    const threshold = 16;

    // adjust the bounds a few times
    for (let sim = 0; sim < simCount; sim++) {
      if (this.collisionResults) {
        this.collisionResults.collisions = [];
      }
      // check for collisions using the quad tree
      this.collisionResults = this.eng.physicsManager.checkForCollision(
        this,
        this.collisionResults
      );

      const others = this.collisionResults.collisions;

      // check what edges over me
      for (let i = 0; i < others.length; i++) {
        const b1 = myRect;
        const b2 = others[i].bounds;
        let xOverLap = b1.edgeOverlapX(b2);
        let yOverLap = b1.edgeOverlapY(b2);

        if (xOverLap != 0) {
          // check if there is another collision with the same top or bottom value
          // that will cancel out this
          for (let j = 0; j < others.length; j++) {
            if (j == i) {
              continue;
            }
            const b3 = others[j].bounds;
            // if top align or bottom align cancel out x
            if (
              Math.abs(b3.top - b2.top) < threshold ||
              Math.abs(b3.bottom - b2.bottom) < threshold
            ) {
              xOverLap = 0;
              break;
            }
          }
        }

        if (xOverLap != 0) {
          console.debug('moving x');
        }

        if (yOverLap != 0) {
          // check if there is another collision with the same top or bottom value
          // that will cancel out this
          for (let j = 0; j < others.length; j++) {
            if (j == i) {
              continue;
            }
            const b3 = others[j].bounds;
            // if top align or bottom align cancel out x
            if (
              Math.abs(b3.right - b2.right) < threshold ||
              Math.abs(b3.left - b2.left) < threshold
            ) {
              yOverLap = 0;
              break;
            }
          }
        }

        // floor is king no x overlap if we are on a floor
        if (yOverLap != 0) {
          xOverLap = 0;
        }

        const left = myRect.left + xOverLap * step;
        const top = myRect.top + yOverLap * step;

        myRect.setPosition(left, top);

        // right overlap and the top of this bounds is greater than the stepHeight
        // see if we need to stop the velocity
        if (xOverLap < 0 && this.nextVelocity.x > 0) {
          // if moving in the direction of the right edge stop moving
          // in the x direction
          this.nextVelocity.x = 0;
        }
        // left overlap
        else if (xOverLap > 0 && this.nextVelocity.x < 0) {
          // if moving in the direction of the left edge stop moving
          // in the x direction
          this.nextVelocity.x = 0;
        }

        // bottom
        if (yOverLap > 0 && this.nextVelocity.y < 0) {
          // if moving in the direction of the bottom edge stop moving
          // in the y direction
          this.nextVelocity.y = 0;
        }
        //top
        else if (yOverLap < 0 && this.nextVelocity.y > 0) {
          this.nextVelocity.y = 0;
        }
      }
    }

    // show the collision
    this.collisionResults.collisions.forEach((c) =>
      this.eng.annotationManager.buildRect(
        c.id,
        c.bounds,
        new vec4([1, 0, 0, 1])
      )
    );

    // adjust the velocity
    //if (adjustment.y > 0 && this.velocity.y < 0) {
    //  this.nextVelocity.y = 0;
    //  this.acceleration.y = 0;
    //  this.instanceVelocity.y = 0;
    // }
  }
}
