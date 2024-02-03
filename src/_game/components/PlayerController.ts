import { UserAction } from '../../core/UserAction';
import { TextureAssets } from '../system/GameAssetManager';
import { TeleportAnimation } from './TeleportAnimation';
import { WalkAnimation } from './WalkAnimation';
import { PlatformEngine } from '../PlatformEngine';

import vec3 from '../../math/vec3';
import { SpriteId } from '../data/SpriteId';
import { ShootAnimation } from './ShootAnimation';
import rect from '../../math/rect';
import { JumpAnimation } from './JumpAnimation';
import { InputState } from '../../core/InputState';
import { RidgeBody } from '../../physics/RidgeBody';
import { PixelsToMeters } from '../../systems/PhysicsManager';
import { Direction } from './Direction';
import { BulletType } from './BulletType';
import { Collision2D } from '../../physics/Collision2D';
import { GameComponent } from './GameComponent';
import { SpriteController2 } from '../../graphics/SpriteController2';
import vec2 from '../../math/vec2';
import { IPlayerOptions } from '../data/ILevelData2';
import { HitAnimation } from './HitAnimation';
import { Curve } from '../../math/Curve';
import {
  EntityState,
  EntityStateFlags,
  EntityStateOptions,
} from '../data/EntityState';

export class PlayerController extends GameComponent {
  private sprite: SpriteController2;

  private entityState: EntityState;
  private ridgeBody: RidgeBody;

  // config options
  private readonly bulletSpeed = 3.0;
  private readonly jumpVelocity = 3.0;

  get id(): string {
    return SpriteId.Player;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.sprite = new SpriteController2(eng);

    // setup entity state
    this.entityState = new EntityState(this.eng);
    this.entityState.onStateChange = this.onStateChange;

    this.ridgeBody = new RidgeBody(
      this.eng,
      'player',
      this,
      new rect([0, 64, 0, 64])
    );
    this.ridgeBody.onPosition = this.updateFromRidgeBodyPosition.bind(this);
    this.ridgeBody.onCollision = this.onCollision.bind(this);
    this.eng.physicsManager.addBody(this.ridgeBody);
  }

  reset(): void {
    // offset the sprite from the center to the top left
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;

    // set the default image and double the scale
    this.sprite.spriteImage('default');
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;

    this.sprite.depth = 0.7;

    // initial the player's position
    // and collision box size
    this.ridgeBody.set(
      0,
      this.sprite.width,
      0 + this.sprite.height,
      this.sprite.height
    );

    // add the ridge body back in
    this.eng.physicsManager.addBody(this.ridgeBody);

    // reset state
    this.entityState.initialize(
      this.sprite,
      this.ridgeBody,
      new EntityStateOptions()
    );
  }

  initialize(): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.edge);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    // offset the sprite from the center to the top left
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;

    // set the default image and double the scale
    this.sprite.spriteImage('default');
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;
    this.sprite.depth = 0.7;

    // initial the player's position
    // and collision box size
    this.ridgeBody.set(
      100,
      this.sprite.width,
      150 + this.sprite.height,
      this.sprite.height
    );
    this.ridgeBody.active = true;
  }

  loadPlayer(options: IPlayerOptions): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.edge);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    // offset the sprite from the center to the top left
    this.sprite.leftOffset = 1;
    this.sprite.topOffset = -1;

    // set the default image and double the scale
    this.sprite.spriteImage('default');
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2.0;
    this.sprite.depth = 0.7;

    this.setPosition(options.position.x, options.position.y);
    this.ridgeBody.showCollision = options.meta.get('debug') == 'true';
    this.ridgeBody.active = true;

    this.entityState.initialize(
      this.sprite,
      this.ridgeBody,
      new EntityStateOptions()
    );
    // start by teleporting down
    this.entityState.teleport(false);
  }

  onStateChange(before: EntityStateFlags, after: EntityStateFlags): void {}

  handleUserAction(state: InputState): boolean {
    if (state.isReleased(UserAction.Up)) {
      this.entityState.teleport(true);
    }
    if (state.isReleased(UserAction.Down)) {
      this.entityState.teleport(false);
    }

    if (!this.ridgeBody.active) {
      return false;
    }

    if (state.isDown(UserAction.Right)) {
      this.entityState.move(true);
    }
    if (state.isDown(UserAction.Left)) {
      this.entityState.move(false);
    }
    if (state.isReleased(UserAction.Right)) {
      this.entityState.stopMoving();
    }
    if (state.isReleased(UserAction.Left)) {
      this.entityState.stopMoving();
    }

    if (state.isReleased(UserAction.A)) {
      this.entityState.shoot();
    }
    if (state.isDown(UserAction.B)) {
      this.entityState.jump();
    }
    if (state.isReleased(UserAction.B)) {
      this.entityState.stopMoving();
    }
    return false;
  }

  private onCollision(collisions: Collision2D[]): void {
    let hitGround = false;
    let hitRightSide = false;
    let hitLeftSide = false;
    // see how we hit the collisions
    for (let c of collisions) {
      if (c.top == this.ridgeBody.bottom) {
        hitGround = true;
      }

      if (c.right == this.ridgeBody.left) {
        hitLeftSide = true;
      }
      if (c.left == this.ridgeBody.right) {
        hitRightSide = true;
      }
    }

    if (!hitGround && (hitLeftSide || hitRightSide)) {
      this.entityState.slidingDown(hitRightSide);
    } else if (hitGround) {
      this.entityState.landed();
    }
  }

  /*
  private shoot(): void {
    const facingRight = this.facingRight;
    this.shootAnimation.start(facingRight);

    // get the start position of the bullet
    const startPos = new vec3(this.ridgeBody.left, this.ridgeBody.bottom, 0);
    startPos.y += 25;
    startPos.x += facingRight ? 35 : -5;

    const speed = this.bulletSpeed; // m/second
    const velocity = new vec3(facingRight ? speed : -speed, 0, 0);
    this.eng.bullets.addBullet({
      bulletType: BulletType.PlayerBullet,
      position: startPos,
      velocity,
    });
  }
*/
  /*
  run(dt: number): void {
    if (!this.teleportAnimation.running && !this.teleportAnimation.isUp) {
      if (this.running) {
        if (this.facingRight) {
          this.ridgeBody.instanceVelocity.x = PixelsToMeters * 500;
        } else {
          this.ridgeBody.instanceVelocity.x = -PixelsToMeters * 500;
        }
      } else {
        this.ridgeBody.instanceVelocity.x = 0;
      }
    }
  }
*/
  /**
   * Used to manually set the player's position.
   * This should only be done during setup and from then on the
   * ridgeBody will manage the position.
   * @param left
   * @param top
   */
  setPosition(left: number, top: number): void {
    this.ridgeBody.set(
      left,
      this.sprite.width,
      top + this.sprite.height,
      this.sprite.height
    );
    this.updateFromRidgeBodyPosition(left, top, this.ridgeBody);
  }

  /**
   * This is used to set the position of the player.
   * This will check for collisions and adjust the position
   * @param position
   */
  private updateFromRidgeBodyPosition(
    left: number,
    top: number,
    body: Collision2D
  ): void {
    // update the screen position.
    this.sprite.left = left; // + this.sprite.width * 0.5;
    this.sprite.top = top; // - this.sprite.height * 0.5;

    // update view manager position
    const forwardPadding = 200;
    const upPadding = 100;
    const xOffset = this.sprite.left - this.eng.width / 2 + forwardPadding;
    const yOffset = this.sprite.top - this.eng.height / 2 + upPadding;
    this.eng.viewManager.setTarget(xOffset, yOffset);
    //console.debug('player: pos ' + this.screenPosition);
  }

  hit(by: Collision2D): void {
    this.entityState.die();

    /*
    if (!this.hitAnimation.isRunning) {
      this.ridgeBody.active = false;
      this.hitAnimation.start(this.facingDirection == Direction.Right);
      this.hitAnimation.onDone = (curve: Curve) => {
        this.eng.sceneManager.setNextScene('level.2.0');
        console.debug('die');
      };
    }
    */
  }

  update(dt: number): void {
    this.entityState.update(dt);
    this.sprite.update(dt);
  }
}
