import { UserAction } from '../../core/UserAction';
import { SpriteController2 } from '../../graphics/SpriteController2';
import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import mat4 from '../../math/mat4';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';
import { PlatformEngine } from '../PlatformEngine';
import { GameComponent } from '../components/GameComponent';
import { TextureAssets } from '../system/GameAssetManager';

/**
 * Creates a toggle button
 */
export class ToggleButton extends GameComponent {
  //onSprite: SpriteInstanceController;
  //offSprite: SpriteInstanceController;
  onSprite: SpriteController2;
  offSprite: SpriteController2;
  private _isOn: boolean;
  private _id: string;
  private _userAction: UserAction;
  private _actionOnDown: boolean;

  get id(): string {
    return this._id;
  }

  get isOn(): boolean {
    return this._isOn;
  }

  set alpha(value: number) {
    this.onSprite.alpha = value;
    this.offSprite.alpha = value;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
  }

  initialize(
    id: string,
    userAction: UserAction,
    actionOnDown: boolean,
    collection: SpriteInstanceCollection
  ): void {
    this._id = id;
    this._userAction = userAction;
    this._actionOnDown = actionOnDown;
    const spriteAsset = this.eng.assetManager.getTexture(TextureAssets.hud);
    this.onSprite = new SpriteController2(this.eng);
    this.onSprite.initialize(spriteAsset.texture, spriteAsset.data);

    //this.onSprite = new SpriteInstanceController(id + '.on', collection);
    this.onSprite.spriteImage(id + '.on');
    this.onSprite.leftOffset = 1;
    this.onSprite.topOffset = -1;
    this.onSprite.xScale = 1;
    this.onSprite.yScale = 1;

    //this.offSprite = new SpriteInstanceController(id + '.off', collection);
    this.offSprite = new SpriteController2(this.eng);
    this.offSprite.initialize(spriteAsset.texture, spriteAsset.data);

    this.offSprite.spriteImage(id + '.off');

    this.offSprite.leftOffset = 1;
    this.offSprite.topOffset = -1;
    this.offSprite.xScale = 1;
    this.offSprite.yScale = 1;
    this.offSprite.visible = false;
  }

  setPosition(pos: vec3): void {
    this.onSprite.left = pos.x;
    this.onSprite.top = pos.y;
    this.onSprite.depth = pos.z;

    this.offSprite.left = pos.x;
    this.offSprite.top = pos.y;
    this.offSprite.depth = pos.z;

    //TODO fix this for all buttons
    this.eng.input.setTouchRect(this.id, {
      name: this.id,
      bounds: new rect([
        this.onSprite.left,
        this.onSprite.width,
        this.onSprite.top,
        this.onSprite.height,
      ]),
      action: this._userAction,
      isDown: false,
      touchId: -1,
    });
  }
  toggle(on: boolean): void {
    this._isOn = on;
    this.onSprite.visible = this._isOn;
    this.offSprite.visible = !this._isOn;
  }

  /**
   * Is this toggle hit
   * @param pos
   * @returns
   */
  isHit(pos: vec2): boolean {
    // hit on x axis
    if (
      pos.x >= this.onSprite.left &&
      pos.x <= this.onSprite.left + this.onSprite.width
    ) {
      // hit on y axis
      if (
        pos.y <= this.onSprite.top + this.onSprite.height &&
        pos.y >= this.onSprite.top
      ) {
        return true;
      }
    }
    return false;
  }

  update(dt: number, projection?: mat4): void {
    this.onSprite.update(dt, projection);
    this.offSprite.update(dt, projection);
  }
}
