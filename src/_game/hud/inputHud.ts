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
  pauseToggle: ToggleButton;

  constructor(eng: PlatformEngine) {
    super(eng);
    this.spriteCollection = new SpriteInstanceCollection(eng);
    this.upToggle = new ToggleButton(this.eng);
    this.rightToggle = new ToggleButton(this.eng);
    this.leftToggle = new ToggleButton(this.eng);
    this.attackToggle = new ToggleButton(this.eng);
    this.jumpToggle = new ToggleButton(this.eng);
    this.pauseToggle = new ToggleButton(this.eng);
  }

  initialize(): void {
    const spriteAsset = this.eng.assetManager.getTexture(TextureAssets.hud);
    this.spriteCollection.initialize(spriteAsset.texture, spriteAsset.data);

    this.upToggle.initialize('up', this.spriteCollection);
    this.rightToggle.initialize('right', this.spriteCollection);
    this.leftToggle.initialize('left', this.spriteCollection);
    this.attackToggle.initialize('attack', this.spriteCollection);
    this.jumpToggle.initialize('jump', this.spriteCollection);
    this.pauseToggle.initialize('pause', this.spriteCollection);

    this.leftToggle.setPosition(new vec3(10, 0, -0.5));
    this.upToggle.setPosition(new vec3(64, 20, -0.5));
    this.rightToggle.setPosition(new vec3(128, 0, -0.5));

    this._projection = mat4.orthographic(
      0,
      this.eng.width,
      0,
      this.eng.height,
      1,
      -1
    );
  }

  update(dt: number): void {
    this.spriteCollection.update(dt, this._projection);
  }
}
