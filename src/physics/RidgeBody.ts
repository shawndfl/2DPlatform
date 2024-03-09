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
  public customGravity: vec3;

  public maxVelocity: vec3;
  public minVelocity: vec3;

  /** the change in position */
  private nextBounds: rect;
  private nextPosition: vec3;
  private nextVelocity: vec3;
  private collisionResults: Collision2D[] = [];

  public get position(): Readonly<vec3> {
    return this._position;
  }

  public childBodies: RidgeBody[];

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
    this.maxVelocity = new vec3(1000);
    this.minVelocity = new vec3(-1000);
    this.force = new vec3();
    this.mass = 10;
    this.active = true;
  }

  private temp = new vec3();

  reset(): void {
    this._requiresUpdate = false;
    this.instanceVelocity.reset();
    this.acceleration.reset();
    this.velocity.reset();
    this.maxVelocity.set(1000, 1000, 1000);
    this.minVelocity.set(-1000, -1000, -1000);
  }

  update(dt: number): void {
    super.update(dt);

    // reset the results
    this.collisionResults = [];

    if (!this.active) {
      return;
    }
    const t = dt * 0.001;

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
    this.nextVelocity.clamp(this.minVelocity, this.maxVelocity);
    this.nextPosition.add(this.nextVelocity.scale(t, this.temp));
    this.nextPosition.add(this.instanceVelocity.scale(t, this.temp));
    this.nextBounds = this.bounds.copy(this.nextBounds); // just used for initial allocation
    this.nextBounds.setPosition(
      this.nextPosition.x * MetersToPixels,
      this.nextPosition.y * MetersToPixels
    );

    // correct next values using other collisions
    this.correctCollision();

    // update position and velocity
    this.nextVelocity.copy(this.velocity);
    // update the position of the bounds, which will update
    // the position of the ridge body, with will update the position of
    // the sprite.
    this.setPos(this.nextBounds.left, this.nextBounds.top);

    // raise the collision events
    this.onHit(this.collisionResults);
  }

  setPos(left: number, top: number): void {
    super.setPos(left, top);

    // set the position from the new bounds
    this._position.x = this.bounds.left * PixelsToMeters;
    this._position.y = this.bounds.top * PixelsToMeters;
  }

  /**
   * Raise collision event
   * @param other
   */
  onHit(others: Collision2D[]): void {
    this.collisionTriggered(others);

    for (let c of others) {
      c.collisionTriggered([this]);
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
    const padding = 3; // pixels

    // check all collision and see if we should be stopped
    for (let i = 0; i < collisions.length; i++) {
      const c = collisions[i];

      // don't collide with yourself or anything that is not active
      if (c === this || !c.active) {
        continue;
      }

      // make sure the type matched the mask
      if ((c.collisionType & this.collideMask) == 0) {
        continue;
      }

      //if (c.id == 'topBack' && b2.intersects(c.bounds)) {
      //  console.debug('got it');
      //}

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
            b2.left = c.bounds.left - b2.width - padding;
          }
          this.collisionResults.push(c);
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
            b2.left = c.bounds.right + padding;
          }
          this.collisionResults.push(c);
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

          this.collisionResults.push(c);
        } else if (b1.top <= c.bounds.bottom && b2.top >= c.bounds.bottom) {
          this.instanceVelocity.y = 0;
          this.nextVelocity.y = 0;
          this.acceleration.y = 0;
          b2.top = c.bounds.bottom;
          this.collisionResults.push(c);
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
  }
}
