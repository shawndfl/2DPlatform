import { InputState } from '../../core/InputState';
import { UserAction } from '../../core/UserAction';
import { ISprite } from '../../graphics/ISprite';
import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import mat4 from '../../math/mat4';
import vec3 from '../../math/vec3';
import { PlatformEngine } from '../PlatformEngine';
import { GameComponent } from '../components/GameComponent';
import { GameAssetManager, TextureAssets } from '../system/GameAssetManager';
import { ToggleButton } from './ToggleButton';

/**
 * This class is used to control the touch screen hud and icons that support it.
 */
export class InputHud extends GameComponent {
  spriteCollection: SpriteInstanceCollection;
  private _projection: mat4;

  upToggle: ToggleButton;
  rightToggle: ToggleButton;
  leftToggle: ToggleButton;
  attackToggle: ToggleButton;
  jumpToggle: ToggleButton;
  startToggle: ToggleButton;

  constructor(eng: PlatformEngine) {
    super(eng);
    this.spriteCollection = new SpriteInstanceCollection(eng);
    this.upToggle = new ToggleButton(this.eng);
    this.rightToggle = new ToggleButton(this.eng);
    this.leftToggle = new ToggleButton(this.eng);
    this.attackToggle = new ToggleButton(this.eng);
    this.jumpToggle = new ToggleButton(this.eng);
    this.startToggle = new ToggleButton(this.eng);
  }

  initialize(): void {
    const spriteAsset = this.eng.assetManager.getTexture(TextureAssets.hud);
    //this.spriteCollection.initialize(spriteAsset.texture, spriteAsset.data);

    this.upToggle.initialize('up', UserAction.Up, true, this.spriteCollection);
    this.rightToggle.initialize(
      'right',
      UserAction.Right,
      false,
      this.spriteCollection
    );
    this.leftToggle.initialize(
      'left',
      UserAction.Left,
      true,
      this.spriteCollection
    );
    this.attackToggle.initialize(
      'attack',
      UserAction.A,
      false,
      this.spriteCollection
    );
    this.jumpToggle.initialize(
      'jump',
      UserAction.B,
      false,
      this.spriteCollection
    );
    this.startToggle.initialize(
      'pause',
      UserAction.Start,
      false,
      this.spriteCollection
    );

    // set alpha
    this.upToggle.alpha = 0.5;
    this.rightToggle.alpha = 0.5;
    this.leftToggle.alpha = 0.5;
    this.attackToggle.alpha = 0.5;
    this.jumpToggle.alpha = 0.5;
    this.startToggle.alpha = 0.5;

    // turn off
    this.upToggle.toggle(false);
    this.rightToggle.toggle(false);
    this.leftToggle.toggle(false);
    this.attackToggle.toggle(false);
    this.jumpToggle.toggle(false);
    this.startToggle.toggle(false);

    this.leftToggle.setPosition(new vec3(10, 80, -0.5));
    this.upToggle.setPosition(new vec3(74, 100, -0.5));
    this.rightToggle.setPosition(new vec3(138, 80, -0.5));

    this.startToggle.setPosition(new vec3(400, 50, -0.5));

    this.attackToggle.setPosition(new vec3(600, 50, -0.5));
    this.jumpToggle.setPosition(new vec3(664, 50, -0.5));

    this._projection = mat4.orthographic(
      0,
      this.eng.width,
      0,
      this.eng.height,
      1,
      -1
    );
  }

  handleUserAction(action: InputState): boolean {
    /*
    //console.debug('input action ', action);
    if (action.inputReleased) {
      if (this.upToggle.isOn) {
        action.buttonsDown = UserAction.None;
        action.buttonsReleased = UserAction.Up;
        this.eng.input.injectSate(action);
      }
      if (this.rightToggle.isOn) {
        action.buttonsDown = UserAction.None;
        action.buttonsReleased = UserAction.Right;
        this.eng.input.injectSate(action);
      }
      if (this.leftToggle.isOn) {
        action.buttonsDown = UserAction.None;
        action.buttonsReleased = UserAction.Left;
        this.eng.input.injectSate(action);
      }
      if (this.attackToggle.isOn) {
        action.buttonsDown = UserAction.None;
        action.buttonsReleased = UserAction.A;
        this.eng.input.injectSate(action);
      }
      if (this.jumpToggle.isOn) {
        action.buttonsDown = UserAction.None;
        action.buttonsReleased = UserAction.B;
        this.eng.input.injectSate(action);
      }
      if (this.startToggle.isOn) {
        action.buttonsDown = UserAction.None;
        action.buttonsReleased = UserAction.Start;
        this.eng.input.injectSate(action);
      }
    }

    if (action.inputDown[0]) {
      if (this.upToggle.isHit(action.touchPoint[0])) {
        action.buttonsDown = action.buttonsDown | UserAction.Up;
        this.eng.input.injectSate(action);
      }
      if (this.rightToggle.isHit(action.touchPoint[0])) {
        action.buttonsDown = action.buttonsDown | UserAction.Right;
        this.eng.input.injectSate(action);
      }
      if (this.leftToggle.isHit(action.touchPoint[0])) {
        action.buttonsDown = action.buttonsDown | UserAction.Left;
        this.eng.input.injectSate(action);
      }
      if (this.attackToggle.isHit(action.touchPoint[0])) {
        action.buttonsDown = action.buttonsDown | UserAction.A;
        this.eng.input.injectSate(action);
      }
      if (this.jumpToggle.isHit(action.touchPoint[0])) {
        action.buttonsDown = action.buttonsDown | UserAction.B;
        this.eng.input.injectSate(action);
      }
      if (this.startToggle.isHit(action.touchPoint[0])) {
        action.buttonsDown = action.buttonsDown | UserAction.Start;
        this.eng.input.injectSate(action);
      }
    }

    this.upToggle.toggle(action.isDown(UserAction.Up));
    this.rightToggle.toggle(action.isDown(UserAction.Right));
    this.leftToggle.toggle(action.isDown(UserAction.Left));
    this.attackToggle.toggle(action.isDown(UserAction.A));
    this.jumpToggle.toggle(action.isDown(UserAction.B));
    this.startToggle.toggle(action.isDown(UserAction.Start));
*/
    return false;
  }

  update(dt: number): void {
    //this.spriteCollection.update(dt, this._projection);
    this.upToggle.update(dt, this._projection);
    this.rightToggle.update(dt, this._projection);
    this.leftToggle.update(dt, this._projection);
    this.attackToggle.update(dt, this._projection);
    this.jumpToggle.update(dt, this._projection);
    this.startToggle.update(dt, this._projection);
  }
}
