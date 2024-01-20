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
  public customGravity: vec3;

  public maxVelocity: vec3;

  /** the change in position */
  private nextBounds: rect;
  private nextPosition: vec3;
  private nextVelocity: vec3;
  private collisionResults: CollisionResults;

  /** events */
  onPositionChange: (newPosition: Readonly<vec3>, body: RidgeBody) => void;
  onFloor: (body: RidgeBody) => void;
  /** all collision this body is hitting */
  onCollision: (collisions: Collision2D[], body: RidgeBody) => void;

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
  update(dt: number): void {
    super.update(dt);

    if (!this.active) {
      this.resetCollision();
      return;
    }
    const t = dt * 0.001;
    // set the current bounds
    this.bounds.setPosition(
      this.position.x * MetersToPixels,
      this.position.y * MetersToPixels + this.bounds.height
    );

    // get a copy of the position and velocity
    this.nextPosition = this.position.copy(this.nextPosition);
    this.nextVelocity = this.velocity.copy(this.nextVelocity);

    // apply acceleration and velocity
    const adjustAcc = this.acceleration.copy();
    if (this.customGravity == null) {
      adjustAcc.add(this.eng.physicsManager.gravity);
    } else {
      adjustAcc.add(this.customGravity);
    }

    // calculate next values
    this.nextVelocity.add(adjustAcc.scale(t, this.temp));
    this.nextPosition.add(this.nextVelocity.scale(t, this.temp));
    this.nextPosition.add(this.instanceVelocity.scale(t, this.temp));
    this.nextBounds = this.bounds.copy(this.nextBounds); // just used for initial allocation
    this.nextBounds.setPosition(
      this.nextPosition.x * MetersToPixels,
      this.nextPosition.y * MetersToPixels + this.bounds.height
    );

    // correct next values using other collisions
    this.correctCollision();

    // update position and velocity
    this.nextVelocity.copy(this.velocity);
    // set the new bounds that were adjusted from correctCollision
    this.bounds.setPosition(this.nextBounds.left, this.nextBounds.top);
    // set the position from the new bounds
    this.position.x = this.bounds.left * PixelsToMeters;
    this.position.y = (this.bounds.top - this.bounds.height) * PixelsToMeters;

    if (this.onPositionChange) {
      this.onPositionChange(this.nextPosition, this);
    }
  }

  /**
   * Correct position, velocity and acceleration when a collision is detected
   *
   */
  correctCollision(): void {
    const collisions = this.eng.physicsManager.getCollision();
    const b1 = this.bounds;
    const b2 = this.nextBounds;

    // check all collision and see if we should be stopped
    for (let i = 0; i < collisions.length; i++) {
      const c = collisions[i];

      // if we are over this collision see if we are touching it.
      if (b2.edgeOverlapX(c.bounds)) {
        // we are colliding with something under us
        if (b1.bottom >= c.bounds.top && b2.bottom <= c.bounds.top) {
          this.instanceVelocity.y = 0;
          this.nextVelocity.y = 0;
          this.acceleration.y = 0;
          b2.top = c.bounds.top + b2.height;
          // the body is at rest on a floor
          if (this.onFloor) {
            this.onFloor(this);
          }
        } else if (b1.top <= c.bounds.bottom && b2.top >= c.bounds.bottom) {
          this.instanceVelocity.y = 0;
          this.nextVelocity.y = 0;
          this.acceleration.y = 0;
          b2.top = c.bounds.bottom;
        }
      }

      if (b1.edgeOverlapY(c.bounds)) {
        // we are colliding with something to the right us
        if (b1.right <= c.bounds.left && b2.right >= c.bounds.left) {
          this.instanceVelocity.x = 0;
          this.nextVelocity.x = 0;
          this.acceleration.x = 0;
          b2.left = c.bounds.left - b2.width;
        }
        // colliding with something to the left
        else if (b1.left >= c.bounds.right && b2.left <= c.bounds.right) {
          this.instanceVelocity.x = 0;
          this.nextVelocity.x = 0;
          this.acceleration.x = 0;
          b2.left = c.bounds.right;
        }
      }
    }

    // check world limits
    const worldBounds = this.eng.physicsManager.bounds;

    // y limits
    if (b2.bottom <= worldBounds.bottom) {
      this.instanceVelocity.y = 0;
      this.nextVelocity.y = 0;
      this.acceleration.y = 0;
      b2.top = worldBounds.bottom + b2.height;
      // the body is at rest on a floor
      if (this.onFloor) {
        this.onFloor(this);
      }
    } else if (b2.top >= worldBounds.top) {
      this.instanceVelocity.y = 0;
      this.nextVelocity.y = 0;
      this.acceleration.y = 0;
      b2.top = worldBounds.top;
    }
    // x limits
    if (b2.right >= worldBounds.right) {
      this.instanceVelocity.x = 0;
      this.nextVelocity.x = 0;
      this.acceleration.x = 0;
      b2.left = worldBounds.right - b2.width;
    } else if (b2.left <= worldBounds.left) {
      this.instanceVelocity.x = 0;
      this.nextVelocity.x = 0;
      this.acceleration.x = 0;
      b2.left = worldBounds.left;
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
  /*
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
      this.touchingGround = true;
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
    const step = 1;
    const simCount = 1;
    const myRect = this.bounds;
    const yOverLapLimit = 11;

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

      // raise onCollision event only on the first iteration
      if (sim == 0 && this.onCollision) {
        this.onCollision(this.collisionResults.collisions, this);
      }

      const others = this.collisionResults.collisions;

      // check what y edges over me
      let yOverLap = 0;
      for (let i = 0; i < others.length; i++) {
        const b1 = myRect;
        const b2 = others[i].bounds;
        yOverLap = b1.edgeOverlapY(b2);

        // bottom
        if (yOverLap > 0 && this.nextVelocity.y < 0) {
          // if moving in the direction of the bottom edge stop moving
          // in the y direction
          this.nextVelocity.y = 0;
          this.velocity.y = 0;
          this.touchingGround = true;
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

      // check x overlap
      let xOverLap = 0;
      for (let i = 0; i < others.length; i++) {
        const b1 = myRect;
        const b2 = others[i].bounds;
        xOverLap = b1.edgeOverlapX(b2);

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
      }

      const left = myRect.left + xOverLap * step;
      const top = myRect.top + yOverLap * step;

      myRect.setPosition(left, top);
    }
  }

  collisionResolutionOld(): void {
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

      // raise onCollision event only on the first iteration
      if (sim == 0 && this.onCollision) {
        this.onCollision(this.collisionResults.collisions, this);
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
  */
}
