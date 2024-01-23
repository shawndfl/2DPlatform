import { UserAction } from '../../core/UserAction';
import { SpritBaseController } from '../../graphics/SpriteBaseController';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { TextureAssets } from '../system/GameAssetManager';
import { TeleportAnimation } from './TeleportAnimation';
import { WalkAnimation } from './WalkAnimation';
import { PlatformEngine } from '../PlatformEngine';
import { TileComponent } from '../tiles/TileComponent';
import vec3 from '../../math/vec3';
import { SpriteId } from '../data/SpriteId';
import { ShootAnimation } from './ShootAnimation';
import rect from '../../math/rect';
import { JumpAnimation } from './JumpAnimation';
import vec2 from '../../math/vec2';
import { InputState } from '../../core/InputState';
import { RidgeBody } from '../../physics/RidgeBody';
import { MetersToPixels, PixelsToMeters } from '../../systems/PhysicsManager';
import { Direction } from './Direction';
import { BulletType } from './BulletType';
import { Collision2D } from '../../physics/Collision2D';

export class PlayerController extends TileComponent {
  private sprite: SpritBatchController;
  private running: boolean;
  private facingDirection: Direction;
  private movementDirection: Direction;
  private teleportAnimation: TeleportAnimation;
  private walk: WalkAnimation;
  private shootAnimation: ShootAnimation;
  private jumpAnimation: JumpAnimation;

  /** a new jump can start after the jump button is released */
  private jumpReset: boolean;
  /** Must be on a floor to start a jump */
  private touchingFloor: boolean;

  /** How many mid air jumps can we do */
  private midAirJump: number;
  private readonly maxMidAirJumps = 1;

  private ridgeBody: RidgeBody;

  // config options
  private readonly bulletSpeed = 3.0;
  private readonly jumpVelocity = 3.0;

  get id(): string {
    return SpriteId.Player;
  }

  get facingRight(): boolean {
    return this.facingDirection == Direction.Right;
  }

  get facingLeft(): boolean {
    return this.facingDirection == Direction.Left;
  }

  public get spriteController(): SpritBaseController {
    return this.sprite;
  }

  constructor(eng: PlatformEngine) {
    super(eng.groundManager, {
      i: 0,
      j: 0,
      options: [],
      spriteName: 'default',
      tileClass: 'PlayerController',
    });
    this.sprite = new SpritBatchController(eng);
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.walk = new WalkAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);

    this.facingDirection = Direction.Right;
    this.movementDirection = Direction.Right;
    this.running = false;
    this.jumpAnimation = new JumpAnimation(eng);
    this.touchingFloor = false;
    this.midAirJump = 0;

    this.ridgeBody = new RidgeBody(
      this.eng,
      'player',
      this,
      new rect([0, 64, 0, 64])
    );
    this.ridgeBody.onPosition = this.setPosition.bind(this);
    this.ridgeBody.onFloor = this.onFloor.bind(this);
    this.eng.physicsManager.addBody(this.ridgeBody);
  }

  initialize(): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.edge);

    this.sprite.initialize(spriteData.texture, spriteData.data);
    // initial the player's position
    this.setTilePosition(2, 10);
    this.ridgeBody.setPos(this.screenPosition.x, this.screenPosition.y);
    this.setPosition(this.ridgeBody.left, this.ridgeBody.top, this.ridgeBody);

    this.sprite.activeSprite(this.id);
    this.sprite.setSprite('teleport.1');
    this.sprite.scale(2.0);

    this.teleportAnimation.initialize(this.sprite);
    this.walk.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);
    this.jumpAnimation.initialize(this.sprite);

    // setup the teleport animation

    this.teleport(false);
  }

  handleUserAction(state: InputState): boolean {
    if (state.isReleased(UserAction.Up)) {
      this.teleport(true);
    }
    if (state.isReleased(UserAction.Down)) {
      this.teleport(false);
    }

    if (!this.ridgeBody.active) {
      return false;
    }

    if (state.isDown(UserAction.Right)) {
      this.walk.start(true);

      this.facingDirection = Direction.Right;
      this.movementDirection = Direction.Right;
      this.running = true;
    }
    if (state.isDown(UserAction.Left)) {
      this.walk.start(false);
      this.facingDirection = Direction.Left;
      this.movementDirection = Direction.Left;
      this.running = true;
    }
    if (state.isReleased(UserAction.Right)) {
      this.walk.stop();
      this.running = false;
    }
    if (state.isReleased(UserAction.Left)) {
      this.walk.stop();
      this.running = false;
    }

    if (state.isReleased(UserAction.A)) {
      this.shoot();
    }
    if (state.isDown(UserAction.B)) {
      if (!this.jumpReset) {
        this.jumpReset = true;
        this.jump();
      }
    }
    if (state.isReleased(UserAction.B)) {
      this.ridgeBody.velocity.y = 0;
      this.jumpReset = false;
    }
    return false;
  }

  private teleport(up: boolean): void {
    this.ridgeBody.active = false;

    // update teleport position
    this.teleportAnimation.groundLevel = this.screenPosition.y;
    this.teleportAnimation.xOffset = this.screenPosition.x;
    this.teleportAnimation.start(up).onDone(() => {
      if (!this.teleportAnimation.isUp) {
        this.ridgeBody.active = true;
      }
    });
  }

  private onFloor(body: RidgeBody): void {
    this.touchingFloor = true;
    this.midAirJump = this.maxMidAirJumps;
  }

  private jump(): void {
    if (this.touchingFloor || this.midAirJump > 0) {
      // use your mid air jumps if we are not touching the floor
      if (!this.touchingFloor) {
        this.midAirJump--;
      }
      this.ridgeBody.velocity.y = this.jumpVelocity;
      this.jumpAnimation.start(false);
      this.touchingFloor = false;
    }
  }

  private shoot(): void {
    const facingRight = this.facingRight;
    this.shootAnimation.start(facingRight);

    // get the start position of the bullet
    const startPos = this._screenPosition.copy();
    startPos.y += 25;
    startPos.x += facingRight ? 35 : -5;
    // must be in meters
    startPos.scale(PixelsToMeters);

    const speed = this.bulletSpeed; // m/second
    const velocity = new vec3(facingRight ? speed : -speed, 0, 0);
    this.eng.bullets.addBullet({
      bulletType: BulletType.PlayerBullet,
      position: startPos,
      velocity,
    });
  }

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

  /**
   * Are the bounds facing away from a given tile
   * @param myBounds
   * @param tile
   * @returns
   */
  facingAwayFromTile(myBounds: Readonly<rect>, tile: TileComponent): boolean {
    if (this.movementDirection == Direction.Right) {
      if (myBounds.right < tile.screenBounds.right) {
        return false;
      }
    }

    if (this.movementDirection == Direction.Left) {
      if (myBounds.left > tile.screenBounds.left) {
        return false;
      }
    }

    return true;
  }

  /**
   * This is used to set the position of the player.
   * This will check for collisions and adjust the position
   * @param position
   */
  setPosition(left: number, top: number, body: Collision2D): void {
    // update the screen position.
    this.setScreenPosition(new vec3(left, top, 0));

    // update view manager position
    const forwardPadding = 200;
    const upPadding = 100;
    const xOffset = this.screenPosition.x - this.eng.width / 2 + forwardPadding;
    const yOffset = this.screenPosition.y - this.eng.height / 2 + upPadding;
    this.eng.viewManager.setTarget(xOffset, yOffset);
    //console.debug('player: pos ' + this.screenPosition);
  }

  update(dt: number): void {
    this.run(dt);

    this.jumpAnimation.update(dt);
    this.teleportAnimation.update(dt);
    this.walk.update(dt);
    this.shootAnimation.update(dt);

    this.sprite.update(dt);
  }
}
