import { Curve } from '../math/Curve';
import { Engine } from '../core/Engine';
import { ISpriteData } from '../graphics/ISpriteData';
import { SpriteFlip } from '../graphics/Sprite';
import { Texture } from '../graphics/Texture';
import { UserAction } from '../core/UserAction';
import { SpritController } from '../graphics/SpriteController';
import vec2 from '../math/vec2';
import { TileComponent } from './TileComponent';
import vec3 from '../math/vec3';
import { InputState } from '../core/InputHandler';
import { AutoMoveController } from './AutoMoveController';

export enum PointingDirection {
  None = 0x00,
  N = 0x01,
  E = 0x02,
  S = 0x04,
  W = 0x08,
}
/**
 * Controls the player sprite.
 */
export class PlayerController extends TileComponent {
  /** The direction the player is facing */
  protected _facingDirection: PointingDirection;
  /** is the player walking */
  private _walking: boolean;
  /** was the player walking last frame */
  private _wasWalking: boolean;
  /** the walk animation. This is just two frames */
  protected _walkAnimation: Curve;
  /** The speed the player can walk at */
  private _speed: number;
  /** Used for animations */
  private _sprites: string[];
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;
  /** Gives us more control over the animations */
  private _resetFlip: boolean;
  /** The slop vector for moving up or down in height. This is set from the environment */
  private _slopVector: vec2;

  /** The direction the player is walking */
  private _walkingDirection: vec3;

  /** used to move the player when screen is tapped */
  private _moveController: AutoMoveController;

  /** The sprite controller for the player */
  protected _spriteController: SpritController;

  /** Can the player walk */
  protected _canWalk: boolean;

  get canWalk(): boolean {
    return this._canWalk;
  }

  /** */
  set canWalk(value: boolean) {
    this._canWalk = value;
    // stop the player from walking and animating
    if (!value) {
      this._walking = false;
      this._walkAnimation.pause(0);
    }
  }

  /**
   * Get the sprite controller
   */
  get spriteController(): SpritController {
    return this._spriteController;
  }

  get id(): string {
    return 'player';
  }

  get type(): string {
    return 'player';
  }

  get heightIndex(): number {
    return this._tileIndex.z;
  }

  set slopVector(val: vec2) {
    this._slopVector = val;
  }

  get slopVector(): vec2 {
    return this._slopVector;
  }

  get facingDirection(): PointingDirection {
    return this._facingDirection;
  }

  constructor(eng: Engine) {
    super(eng);
    this._facingDirection = PointingDirection.S;
    this._walking = false;
    this._speed = 3.0; // tiles per second
    this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
    //this._sprites = ['mario.down.step', 'mario.down.step'];
    this._spriteFlip = false;
    this._resetFlip = false;
    this._walkingDirection = new vec3([0, 0, 0]);
    this._slopVector = new vec2([0, 0]);
    this._moveController = new AutoMoveController(this.eng);
    this._canWalk = true;
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(spriteSheet, characterData);

    this._spriteController.scale(2);
    this._spriteController.setSprite('ness.left.stand');
    // set the position of the sprite in the center of the screen
    this.setTilePosition(4, 5, 1);

    this._walkAnimation = new Curve();
    this._walkAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 150 },
        { p: 1, t: 300 },
      ])
      .repeat(-1);

    console.info('sprite list ', this._spriteController.getSpriteList());
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    // the player is taking over now
    this._moveController.cancelMove();

    //console.debug('action ' + action + ' was walking ' + wasWalking);
    this._facingDirection = PointingDirection.None;
    this._walking = false;

    // if the player cannot walk don;t let them
    if (!this.canWalk) {
      return true;
    }

    // if the user tapped or clicked on the screen
    if ((state.action & UserAction.Tap) > 0) {
      //this.handleTap(state);
    } else if ((state.action & UserAction.ActionPressed) > 0) {
      // action event
      this.eng.scene.ground.raisePlayerAction(this);
    } else if ((state.action & UserAction.MenuPressed) > 0) {
      this.eng.dialogManager.showGameMenu();
    } else {
      const screenDirection = new vec2();
      // use arrow keys or d-pad on a game controller
      if ((state.action & UserAction.Left) > 0) {
        this._facingDirection = this._facingDirection | PointingDirection.W;
        screenDirection.x -= 1;
        this._walking = true;
      }
      if ((state.action & UserAction.Right) > 0) {
        this._facingDirection = this._facingDirection | PointingDirection.E;
        screenDirection.x += 1;
        this._walking = true;
      }
      if ((state.action & UserAction.Up) > 0) {
        this._facingDirection = this._facingDirection | PointingDirection.N;
        screenDirection.y += 1;
        this._walking = true;
      }
      if ((state.action & UserAction.Down) > 0) {
        this._facingDirection = this._facingDirection | PointingDirection.S;
        screenDirection.y -= 1;
        this._walking = true;
      }

      this._walkingDirection.x = screenDirection.x * this._speed;
      this._walkingDirection.y = screenDirection.y * this._speed;
      this._walkingDirection.z = vec2.dot(screenDirection, this._slopVector) * this._speed;

      // convert movement vector from screen space to tile space
      this._walkingDirection = this.eng.tileHelper.rotateToTileSpace(this._walkingDirection);
    }

    // We are now walking start the animations
    if (!this._wasWalking && this._walking) {
      this._walkAnimation.start(true);
    } else if (!this._walking) {
      this._walkAnimation.pause(0);
      // this is needed for resetting the walk
      // animation when facing north.
      // we do not want to reset flip when the
      // player is facing right or left
      if (this._resetFlip) {
        this._spriteFlip = false;
      }
    }

    return true;
  }

  /**
   * Handle the tap event. This will allow the player to touch a point on the screen
   * and the character will walk towards that point. If the character can not get there in 2
   * seconds the character will stop moving. When the character gets to the destination the action
   * event will be raised automatically.
   * @param state
   */
  handleTap(state: InputState) {
    let touch = state.touchPoint;
    const screen = new vec2();

    // x and y screen points are offset by the projection offset.
    screen.x = touch.x;
    screen.y = touch.y;

    console.debug('touch point ' + screen.toString());

    this._moveController.startMove(
      screen,
      this,
      () => {
        // reset direction and walking
        this._facingDirection = PointingDirection.None;
        this._walking = false;
      },
      (direction: vec2) => {
        const dir = direction.copy();
        dir.normalize();

        const deadZone = 0.5;
        console.debug('t-> pos ' + this.screenPosition);
        console.debug('t-> target ' + this._moveController.target);
        console.debug('t-> direction ' + dir, direction.length().toFixed(3));

        // move left
        if (dir.x < -deadZone) {
          this._facingDirection = this._facingDirection | PointingDirection.W;
          this._walking = true;
          console.debug('t->  moving left ');
        }
        // move right
        else if (dir.x > deadZone) {
          this._facingDirection = this._facingDirection | PointingDirection.E;
          this._walking = true;
          console.debug('t->  moving right ');
        }

        // move down
        if (dir.y < -deadZone) {
          this._facingDirection = this._facingDirection | PointingDirection.S;
          this._walking = true;
          console.debug('t->  moving down ');
        }
        // move up
        else if (dir.y > deadZone) {
          this._facingDirection = this._facingDirection | PointingDirection.N;
          this._walking = true;
          console.debug('t->  moving up ');
        }

        // We are now walking start the animations
        if (!this._wasWalking && this._walking) {
          this._walkAnimation.start(true);
        } else if (!this._walking) {
          this._walkAnimation.pause(0);
        }
      },
      (target: vec2, timeOut: boolean) => {
        if (!timeOut) {
          // action event
          this.eng.scene.ground.raisePlayerAction(this);
        }
        // we are done moving so reset everything
        this._walking = false;
        this._facingDirection = PointingDirection.None;
        this._walkAnimation.pause(0);
        // TODO move the the target position
        //const tile = this.eng.tileHelper.toTileLoc(target, 1);
        //this.moveToTilePosition(tile.x, tile.y);
      }
    );
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this._walkAnimation.update(dt);
    this._moveController.update(dt);

    this.walkAnimation(dt, this._facingDirection);
  }

  walkAnimation(dt: number, direction: PointingDirection) {
    this._resetFlip = false;

    // check multiple angle movements first so the else statements work correctly
    if ((direction & PointingDirection.S) > 0 && (direction & PointingDirection.W) > 0) {
      this._sprites = ['ness.down.left.stand', 'ness.down.left.step'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.S) > 0 && (direction & PointingDirection.E) > 0) {
      this._sprites = ['ness.down.left.stand', 'ness.down.left.step'];
      this._spriteFlip = true;
    } else if ((direction & PointingDirection.N) > 0 && (direction & PointingDirection.W) > 0) {
      this._sprites = ['ness.up.left.stand', 'ness.up.left.step'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.N) > 0 && (direction & PointingDirection.E) > 0) {
      this._sprites = ['ness.up.left.stand', 'ness.up.left.step'];
      this._spriteFlip = true;
    } else if ((direction & PointingDirection.E) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = true;
    } else if ((direction & PointingDirection.W) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.S) > 0) {
      this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.N) > 0) {
      this._sprites = ['ness.up.step', 'ness.up.step'];
      this._spriteFlip = false;
      this._resetFlip = true;
      if (this._walkAnimation.getValue() == 1) {
        this._spriteFlip = true;
      }
    }

    // only move if we are walking
    if (this._walking) {
      // scale velocity by time
      const moveVector = this._walkingDirection.scale(dt / 1000.0);

      // screen space converted to tile space for x and y position (ground plane)
      // then use the movement dot of the slope vector which will allow the player for
      // move up and down on stairs and slops
      this.OffsetTilePosition(moveVector.x, moveVector.y, moveVector.z);
    }

    // toggle and animation. This can happen when not walking too.
    if (this._walkAnimation.getValue() == 0) {
      this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[0]);
    } else if (this._walkAnimation.getValue() == 1) {
      this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[1]);
    }

    this._wasWalking = this._walking;
  }

  protected updateSpritePosition() {
    super.updateSpritePosition();

    console.debug('pos ' + this.tilePosition.toString() + '\n  : ' + this.screenPosition.toString());

    // update the view manger with the player new position
    this.eng.viewManager.setTarget(
      this.screenPosition.x - this.eng.width * 0.5,
      -this.eng.height * 0.5 + this.screenPosition.y
    );
  }
}
