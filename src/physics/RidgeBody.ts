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

  private newPos: vec3;
  private newVel: vec3;
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
      this.newPos = this.position.copy(this.newPos);
      this.newVel = this.velocity.copy(this.newVel);

      // apply acceleration and velocity
      const adjustAcc = this.acceleration
        .copy()
        .add(this.eng.physicsManager.gravity);

      this.newVel.add(adjustAcc.scale(t, this.temp));
      this.newPos.add(this.newVel.scale(t, this.temp));

      let colliding = false;
      // check collision
      // adjust position, acceleration, velocity
      if (this.collisionCorrection(this.position, this.newPos)) {
        this.newVel.reset();
        this.acceleration.reset();
        colliding = true;
      }

      // update position and velocity
      this.newPos.copy(this.position);
      this.newVel.copy(this.velocity);
      this.bounds.setPosition(
        this.newPos.x * MetersToPixels,
        this.newPos.y * MetersToPixels + this.bounds.height
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
        this.onPositionChange(this.newPos);
      }
    }
  }

  /**
   * Checks for a collision and corrects the nextPosition.
   * @param position
   * @param nextPosition
   * @returns true if there is a collision and false otherwise
   */
  collisionCorrection(position: vec3, nextPosition: vec3): boolean {
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
      nextPosition.x * MetersToPixels,
      nextPosition.y * MetersToPixels + this.bounds.height
    );

    // check for collisions
    this.collisionResults = this.eng.physicsManager.checkForCollision(
      this,
      this.collisionResults
    );

    // show collisions
    this.collisionResults.collisions.forEach((c) => {
      this.eng.annotationManager.buildRect(
        c.id,
        c.bounds,
        new vec4([1, 0, 0, 1])
      );

      // this collision is inside another move it up.
      if (
        c.bounds.top > this.bounds.bottom &&
        c.bounds.bottom < this.bounds.bottom
      ) {
        this.newPos.y = c.bounds.top * PixelsToMeters;
      }
    });

    const height = 0;
    this.eng.annotationManager.buildLine({
      start: new vec2(0, height),
      end: new vec2(1000, height),
      color: new vec4([1, 0, 0, 1]),
      id: 'baseline',
    });

    if (nextPosition.y <= height) {
      nextPosition.y = height;
      return true;
    }
    return this.collisionResults.collisions.length > 0;
  }
}
