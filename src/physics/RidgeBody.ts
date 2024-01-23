import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import rect from '../math/rect';
import vec3 from '../math/vec3';
import { MetersToPixels, PixelsToMeters } from '../systems/PhysicsManager';
import { Collision2D } from './Collision2D';
import { CollisionResults } from './QuadTree';

export class RidgeBody extends Collision2D {
  /** meters */
  private _position: vec3;
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

  public get position(): Readonly<vec3> {
    return this._position;
  }

  public childBodies: RidgeBody[];

  /** events */
  //onPositionChange: (newPosition: Readonly<vec3>, body: RidgeBody) => void;
  onFloor: (body: RidgeBody) => void;

  constructor(
    eng: Engine,
    id: string,
    tag: Component,
    bounds?: Readonly<rect>
  ) {
    super(eng, id, tag, bounds);
    this._position = new vec3();
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
    // update the position of the bounds, which will update
    // the position of the ridge body, with will update the position of
    // the sprite.
    this.setPos(this.nextBounds.left, this.nextBounds.top);
  }

  setPos(left: number, top: number): void {
    super.setPos(left, top);

    // set the position from the new bounds
    this._position.x = this.bounds.left * PixelsToMeters;
    this._position.y = (this.bounds.top - this.bounds.height) * PixelsToMeters;
  }

  /**
   * Raise collision event
   * @param other
   */
  onHit(other: Collision2D): void {
    this.collisionTriggered(other);

    // this might be the physics limit it is colliding with
    // so the other is null
    if (other) {
      other.collisionTriggered(this);
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
      if (c.id == 'topBack' && b2.intersects(c.bounds)) {
        console.debug('got it');
      }

      if (b2.edgeOverlapY(c.bounds, true)) {
        const stepLimit = 10;
        const stepHeight = c.bounds.top - b2.bottom;

        // we are colliding with something to the right us
        if (b1.right <= c.bounds.left && b2.right >= c.bounds.left) {
          // just step over it if we can
          if (stepHeight <= stepLimit) {
            b2.top = c.bounds.top + b2.height;
          } else {
            this.instanceVelocity.x = 0;
            this.nextVelocity.x = 0;
            this.acceleration.x = 0;
            b2.left = c.bounds.left - b2.width;
          }
          this.onHit(c);
          continue;
        }
        // colliding with something to the left
        else if (b1.left >= c.bounds.right && b2.left <= c.bounds.right) {
          // just step over it if we can
          if (stepHeight <= stepLimit) {
            b2.top = c.bounds.top + b2.height;
          } else {
            this.instanceVelocity.x = 0;
            this.nextVelocity.x = 0;
            this.acceleration.x = 0;
            b2.left = c.bounds.right;
          }
          this.onHit(c);
          continue;
        }
      }

      // if we are over this collision see if we are touching it.
      if (b2.edgeOverlapX(c.bounds, true)) {
        // we are colliding with something under us
        if (b1.top >= c.bounds.top && b2.bottom <= c.bounds.top) {
          this.instanceVelocity.y = 0;
          this.nextVelocity.y = 0;
          this.acceleration.y = 0;
          b2.top = c.bounds.top + b2.height;

          this.onHit(c);

          // the body is at rest on a floor
          if (this.onFloor) {
            this.onFloor(this);
          }
        } else if (b1.top <= c.bounds.bottom && b2.top >= c.bounds.bottom) {
          this.instanceVelocity.y = 0;
          this.nextVelocity.y = 0;
          this.acceleration.y = 0;
          b2.top = c.bounds.bottom;
          this.onHit(c);
        }
      }
    }

    // check world limits
    const worldBounds = this.eng.physicsManager.bounds;
    let hitLimit: boolean = false;
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
      hitLimit = true;
    } else if (b2.top >= worldBounds.top) {
      this.instanceVelocity.y = 0;
      this.nextVelocity.y = 0;
      this.acceleration.y = 0;
      b2.top = worldBounds.top;
      hitLimit = true;
    }
    // x limits
    if (b2.right >= worldBounds.right) {
      this.instanceVelocity.x = 0;
      this.nextVelocity.x = 0;
      this.acceleration.x = 0;
      b2.left = worldBounds.right - b2.width;
      hitLimit = true;
    } else if (b2.left <= worldBounds.left) {
      this.instanceVelocity.x = 0;
      this.nextVelocity.x = 0;
      this.acceleration.x = 0;
      b2.left = worldBounds.left;
      hitLimit = true;
    }

    if (hitLimit) {
      this.onHit(null);
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
}
