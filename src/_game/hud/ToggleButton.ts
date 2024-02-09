import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../../graphics/SpriteInstanceController';
import vec3 from '../../math/vec3';
import { GameComponent } from '../components/GameComponent';

/**
 * Creates a toggle button
 */
export class ToggleButton extends GameComponent {
  onSprite: SpriteInstanceController;
  offSprite: SpriteInstanceController;
  private _isOn: boolean;

  get isOn(): boolean {
    return this._isOn;
  }

  initialize(id: string, collection: SpriteInstanceCollection): void {
    this.onSprite = new SpriteInstanceController(id + '.on', collection);
    this.onSprite.spriteImage(id + '.on');
    this.onSprite.leftOffset = 1;
    this.onSprite.topOffset = 1;
    this.onSprite.xScale = 0.5;
    this.onSprite.yScale = 0.5;

    this.offSprite = new SpriteInstanceController(id + '.off', collection);
    this.offSprite.spriteImage(id + '.off');

    this.offSprite.leftOffset = 1;
    this.offSprite.topOffset = 1;
    this.offSprite.xScale = 0.5;
    this.offSprite.yScale = 0.5;
    this.offSprite.topOffset = 0.5;
    this.offSprite.visible = false;
  }

  setPosition(pos: vec3): void {
    this.onSprite.left = pos.x;
    this.onSprite.top = pos.y;
    this.onSprite.depth = pos.z;

    this.offSprite.left = pos.x;
    this.offSprite.top = pos.y;
    this.offSprite.depth = pos.z;
  }
  toggle(on: boolean): void {
    this._isOn = on;
    this.onSprite.visible = this._isOn;
    this.offSprite.visible = !this._isOn;
  }

  update(dt: number): void {}
}
