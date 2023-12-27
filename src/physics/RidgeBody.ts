import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';

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
  public instanceVelocity: vec3;
  public force: vec3;
  public mass: number;
  public active: boolean;
  public useGravity: boolean;

  public maxVelocity: vec3;

  private nextPosition: vec3;
  private nextVelocity: vec3;
  private collisionResults: CollisionResults;

  /** events */
  onPositionChange: (newPosition: Readonly<vec3>) => void;
  onFloor: (body: RidgeBody) => void;
  /** all collision this body is hitting */
  onCollision: (collisions: Collision2D[]) => void;

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
    this.useGravity = true;
  }

  private temp = new vec3();
  update(dt: number): void {
    if (!this.active) {
      this.resetCollision();
      return;
    }
    const t = dt * 0.001;
    // get a copy of the position and velocity
    this.nextPosition = this.position.copy(this.nextPosition);
    this.nextVelocity = this.velocity.copy(this.nextVelocity);

    // apply acceleration and velocity
    const adjustAcc = this.acceleration.copy();
    if (this.useGravity) {
      adjustAcc.add(this.eng.physicsManager.gravity);
    }

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

    this.renderCollisions();

    if (this.onPositionChange) {
      this.onPositionChange(this.nextPosition);
    }
  }

  private renderCollisions(): void {
    // show the collision
    this.collisionResults.collisions.forEach((c) => {
      if (c.showCollision) {
        this.eng.annotationManager.buildRect(
          c.id,
          c.bounds,
          new vec4([1, 0, 0, 1])
        );
      }
    });

    if (this.showCollision) {
      if (this.collisionResults.collisions.length > 0) {
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
    }
  }

  private resetCollision(): void {
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
    this.eng.annotationManager.removeRect(this.id + '_collision');
  }
  /**
   * Checks all collisions that are overlapping this one and adjusts the nextPosition, nextVelocity, and instanceVelocity.
   * @param position
   * @param nextPosition
   * @returns true if there is a collision and false otherwise
   */
  collisionCorrection(): boolean {
    // clear old collision
    this.resetCollision();

    // the bounds are used for collision detection
    // make sure they are up to date.
    this.bounds.setPosition(
      this.nextPosition.x * MetersToPixels,
      this.nextPosition.y * MetersToPixels + this.bounds.height
    );

    this.collisionResolution();

    // set the new position
    this.nextPosition.x = this.bounds.left * PixelsToMeters;
    this.nextPosition.y =
      (this.bounds.top - this.bounds.height) * PixelsToMeters;

    // bounds of the physics manager
    const left = this.eng.physicsManager.bounds.left * PixelsToMeters;
    const right =
      (this.eng.physicsManager.bounds.right - this.bounds.width) *
      PixelsToMeters;
    const top = this.eng.physicsManager.bounds.top * PixelsToMeters;
    const bottom = this.eng.physicsManager.bounds.bottom * PixelsToMeters;
    let hitLimit = false;
    if (this.nextPosition.y <= bottom) {
      this.nextPosition.y = bottom;
      this.nextVelocity.y = 0;
      this.instanceVelocity.y = 0;
      // the body is at rest on a floor
      if (this.onFloor) {
        this.onFloor(this);
      }
      hitLimit = true;
    } else if (this.nextPosition.y >= top) {
      this.nextPosition.y = top;
      this.nextVelocity.y = 0;
      this.instanceVelocity.y = 0;
      hitLimit = true;
    }
    if (this.nextPosition.x <= left) {
      this.nextPosition.x = left;
      this.nextVelocity.x = 0;
      this.instanceVelocity.x = 0;
      hitLimit = true;
    } else if (this.nextPosition.x >= right) {
      this.nextPosition.x = right;
      this.nextVelocity.x = 0;
      this.instanceVelocity.x = 0;
      hitLimit = true;
    }

    if (hitLimit) {
      return true;
    }

    return this.collisionResults.collisions.length > 0;
  }

  collisionResolution(): void {
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

      // raise onCollision event
      if (sim == 0 && this.onCollision) {
        this.onCollision(this.collisionResults.collisions);
      }

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

        // y axis is king no x overlap if we are on a floor
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
          this.velocity.x = 0;
        }
        // left overlap
        else if (xOverLap > 0 && this.nextVelocity.x < 0) {
          // if moving in the direction of the left edge stop moving
          // in the x direction
          this.nextVelocity.x = 0;
          this.velocity.x = 0;
        }

        // bottom
        if (yOverLap > 0 && this.nextVelocity.y < 0) {
          // if moving in the direction of the bottom edge stop moving
          // in the y direction
          this.nextVelocity.y = 0;
          this.velocity.y = 0;

          // the body is at rest on a floor
          if (this.onFloor) {
            this.onFloor(this);
          }
        }
        //top
        else if (yOverLap < 0 && this.nextVelocity.y > 0) {
          this.nextVelocity.y = 0;
          this.velocity.y = 0;
        }
      }
    }
  }
}
