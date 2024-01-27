import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import vec3 from '../../math/vec3';
import { Random } from '../../utilities/Random';
import { PlatformEngine } from '../PlatformEngine';
import { BulletController } from '../components/BulletController';
import { BulletType } from '../components/BulletType';
import { GameComponent } from '../components/GameComponent';
import { TextureAssets } from './GameAssetManager';

export class BulletOptions {
  /** in meters */
  position: vec3;
  /** in meters per second */
  velocity: vec3;
  bulletType: BulletType;
}

export class BulletManager extends GameComponent {
  readonly MaxBullets: number = 50;
  private bullets: BulletController[] = [];
  private inactiveBullets: BulletController[] = [];
  private sprite: SpriteInstanceCollection;

  constructor(eng: PlatformEngine) {
    super(eng);
    this.sprite = new SpriteInstanceCollection(this.eng);
  }

  /**
   * Add a bullet
   * @param options
   * @returns
   */
  addBullet(options: BulletOptions): BulletController {
    const bullet = this.inactiveBullets.pop();

    if (bullet) {
      bullet.initialize(this.sprite, options);
      this.bullets.push(bullet);
    }
    return bullet;
  }

  initialize(): void {
    const texture = this.eng.assetManager.getTexture(TextureAssets.edge);
    this.sprite.initialize(texture.texture, texture.data);

    for (let i = 0; i < this.MaxBullets; i++) {
      this.inactiveBullets.push(new BulletController(this.eng, 'bullet_' + i));
    }
  }

  update(dt: number): void {
    this.sprite.update(dt);

    this.bullets.forEach((b) => {
      b.update(dt);
      if (!b.active) {
        this.inactiveBullets.push(b);
      }
    });

    this.bullets = this.bullets.filter((b) => b.active);
  }

  reset(): void {
    this.bullets.forEach((b) => {
      b.destroy();
    });
    this.inactiveBullets = [];
    this.bullets = [];
  }
}
