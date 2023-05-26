import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritController } from '../graphics/SpriteController';
import { TileComponent } from './TileComponent';
import CharacterData from '../assets/characters.json';
import { TileFactory } from '../systems/TileFactory';
import { Curve } from '../math/Curve';
import { SpriteFlip } from '../graphics/Sprite';

export class NpcComponent extends TileComponent {
  protected _spriteController: SpritController;
  protected _type;
  protected _tileId;
  protected _spriteId;

  /** Sprite animation */
  protected _sprites: string[];
  /** the walk animation. This is just two frames */
  protected _idleAnimation: Curve;
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;

  get spriteController(): SpritBaseController {
    return this._spriteController;
  }
  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return 'npc.poo';
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    console.warn('npc component');
    return false;
  }

  constructor(eng: Engine, typeAndSprite: string, i: number, j: number, k: number) {
    super(eng);
    const parts = typeAndSprite.split('|');
    this._type = parts[0];
    this._spriteId = parts[1];
    this._tileId = TileFactory.createStaticID(i, j, k);

    this._spriteController = new SpritController(eng);
    this._spriteController.initialize(this.eng.assetManager.character.texture, CharacterData);

    this._spriteController.scale(this.eng.tileScale);
    this._spriteController.setSprite('poo.down.step');

    // offset by half so he stands in the middle of the tile
    this.setTilePosition(i + 0.5, j + 0.5, k);
    this._spriteController.commitToBuffer();

    this._idleAnimation = new Curve();
    this._idleAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 600 },
        { p: 1, t: 1200 },
      ])
      .repeat(-1);
    this._idleAnimation.start(true);

    // this tile will be animated
    this.groundManager.registerForUpdate(this);
  }

  /**
   * Called when the player hits the action button
   * @param tileComponent
   */
  onPlayerAction(tileComponent: TileComponent) {
    this.eng.dialogManager.showDialog(
      'Welcome to Earth Quest!',
      { x: 20, y: 40, width: 400, height: 200 },
      (dialog) => {
        // start a battle
        this.eng.battleManager.startBattle({});
        return true;
      }
    );
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this.runIdle(dt);
  }

  runIdle(dt: number) {
    this._idleAnimation.update(dt);
    this._sprites = ['poo.down.step', 'poo.down.step'];

    const index = this._idleAnimation.getValue();
    if (index == 0) {
      this._spriteFlip = true;
    } else if (index == 1) {
      this._spriteFlip = false;
    }

    this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
    this._spriteController.setSprite(this._sprites[index]);
  }
}
