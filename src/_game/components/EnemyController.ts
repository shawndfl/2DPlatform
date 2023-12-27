import { Engine } from '../../core/Engine';
import { SpriteFlip } from '../../graphics/Sprite';
import { SpritBaseController } from '../../graphics/SpriteBaseController';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { RidgeBody } from '../../physics/RidgeBody';
import { PixelsToMeters } from '../../systems/PhysicsManager';
import { PlatformEngine } from '../PlatformEngine';
import { TextureAssets } from '../system/GameAssetManager';
import { ITileCreationArgs, TileComponent } from '../tiles/TileComponent';
import { Direction } from './Direction';
import { GameComponent } from './GameComponent';

import { ShootAnimation } from './ShootAnimation';
import { TeleportAnimation } from './TeleportAnimation';

export class EnemyController extends TileComponent {
  private sprite: SpritBatchController;
  private facingDirection: Direction;
  private movementDirection: Direction;
  private shootAnimation: ShootAnimation;
  private ridgeBody: RidgeBody;
  private teleportAnimation: TeleportAnimation;

  // config options
  private readonly bulletSpeed = 3.0;
  private readonly jumpVelocity = 3.0;

  public get spriteController(): SpritBaseController {
    return this.sprite;
  }

  constructor(eng: PlatformEngine, tileData: ITileCreationArgs) {
    super(eng.groundManager, tileData);

    this._id = this.createTileId('enemy', this._tileData.i, this._tileData.j);

    this.sprite = new SpritBatchController(eng);
    this.teleportAnimation = new TeleportAnimation(this.eng);
    this.shootAnimation = new ShootAnimation(this.eng);
    this.ridgeBody = new RidgeBody(this.eng, this.id, this);

    // we need this tile to call update(dt)
    this._requiresUpdate = true;
  }

  initialize(): void {
    const spriteData = this.eng.assetManager.getTexture(TextureAssets.enemies);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    this.sprite.activeSprite(this.id);
    this.sprite.setSprite('teleport.1');
    this.sprite.flip(SpriteFlip.XFlip); // face the left
    this.sprite.scale(2.0);

    // set the position of the tile and the ridge body
    this.setTilePosition(this._tileData.i, this._tileData.j);
    this.ridgeBody.setBounds(this.screenBounds);
    this.ridgeBody.position = this.screenPosition.copy().scale(PixelsToMeters);
    this.eng.physicsManager.addBody(this.ridgeBody);

    this.teleportAnimation.initialize(this.sprite);
    this.shootAnimation.initialize(this.sprite);

    // initial enemy
    this.teleport(false);
  }

  run(dt: number): void {
    if (!this.teleportAnimation.running && !this.teleportAnimation.isUp) {
    }
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

  update(dt: number) {
    this.run(dt);

    this.teleportAnimation.update(dt);

    this.shootAnimation.update(dt);

    this.sprite.update(dt);
  }
}
