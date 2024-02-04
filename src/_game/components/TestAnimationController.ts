import { InputState } from '../../core/InputState';
import { UserAction } from '../../core/UserAction';
import { SpritBaseController } from '../../graphics/SpriteBaseController';
import { PlatformEngine } from '../PlatformEngine';
import { AnimationComponent } from './AnimationComponent';
import { TeleportAnimation } from './TeleportAnimation';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { ShootAnimation } from './ShootAnimation';
import { TextureAssets } from '../system/GameAssetManager';

/*
export class TestAnimationController extends TileComponent {
  private sprite: SpritBatchController;
  private speedScale: number;
  private backwards: boolean;
  private animation: AnimationComponent;

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
    this.backwards = false;
    this.speedScale = 1.0;
  }

  initialize(): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.edge);
    this.sprite.initialize(spriteData.texture, spriteData.data);
    this.setTilePosition(3, 9);

    // set up all animations
    const teleport = new TeleportAnimation(this.eng);
    teleport.groundLevel = this.screenPosition.y;
    teleport.xOffset = this.screenPosition.x;

    const walk = new WalkAnimation(this.eng);

    const shoot = new ShootAnimation(this.eng);

    this.animation = shoot;

    // initialize
    this.animation.initialize(this.sprite);

    this.sprite.setSprite('default');
    this.sprite.scale(2.0);
  }

  handleUserAction(state: InputState): boolean {
    if (state.isDown(UserAction.Right)) {
      return true;
    }
    if (state.isDown(UserAction.Left)) {
      return true;
    }
    if (state.isReleased(UserAction.Right)) {
      this.animation.start(this.backwards);
      console.debug(
        'playing ' +
          (this.backwards ? ' - backwards ' : '') +
          ' speed: ' +
          this.getSpeedString()
      );

      return true;
    }
    if (state.isReleased(UserAction.Left)) {
      this.animation.start(!this.backwards);
      console.debug(
        'playing ' +
          (this.backwards ? ' - backwards ' : '') +
          ' speed: ' +
          this.getSpeedString()
      );

      return true;
    }

    if (state.isReleased(UserAction.Up)) {
      this.speedScale += 0.05;
      if (this.speedScale > 1.0) {
        this.speedScale = 1.0;
      }
      console.debug('Speed Scale ' + ' speed: ' + this.getSpeedString());
    }
    if (state.isReleased(UserAction.Down)) {
      this.speedScale -= 0.05;
      if (this.speedScale < 0.05) {
        this.speedScale = 0.05;
      }
      console.debug('Speed Scale ' + ' speed: ' + this.getSpeedString());
    }
    return false;
  }

  private getSpeedString(): string {
    const speed = this.speedScale * 100;
    return speed.toFixed(2) + '%';
  }

  update(dt: number): void {
    this.animation.update(dt * this.speedScale);

    this.sprite.update(dt);
  }
}
*/
