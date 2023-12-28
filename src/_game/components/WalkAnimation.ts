import { SpriteFlip } from '../../graphics/ISprite';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { Curve } from '../../math/Curve';
import { AnimationComponent } from './AnimationComponent';

export class WalkAnimation extends AnimationComponent {
  private curve: Curve;
  private sprite: SpritBatchController;
  private firstOne: boolean;
  private facingRight: boolean;

  initialize(sprite: SpritBatchController): void {
    this.sprite = sprite;
    this.curve = new Curve();
    const points: { p: number; t: number }[] = [];

    this.firstOne = true;
    this.facingRight = true;

    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 50 });
    points.push({ p: 3, t: 100 });
    points.push({ p: 4, t: 150 });
    points.push({ p: 5, t: 200 });
    points.push({ p: 6, t: 250 });
    points.push({ p: 7, t: 300 });
    points.push({ p: 8, t: 350 });
    points.push({ p: 8, t: 400 });
    points.push({ p: 9, t: 450 });
    points.push({ p: 10, t: 500 });
    points.push({ p: 10, t: 550 });

    this.curve.points(points);
    let lastValue = -1;
    this.curve.onUpdate((value) => {
      // wait for the value to change
      if (value == lastValue) {
        return;
      }
      lastValue = value;

      // animation sprites
      if (!this.firstOne) {
        value++;
      }
      value = value > 10 ? 2 : value;
      this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip);
      this.sprite.setSprite('run.' + value);

      if (value >= 10) {
        this.firstOne = false;
      }
    });
  }

  stop(): WalkAnimation {
    this.sprite.setSprite('default');
    this.curve.pause();
    return this;
  }

  start(facingRight: boolean): WalkAnimation {
    this.facingRight = facingRight;

    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    if (!this.curve.isRunning()) {
      // start moving
      this.firstOne = true;
      this.curve.repeat(-1).start(true);

      // set the first frame
      this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip);
      this.sprite.setSprite('run.1');
    }
    return this;
  }

  update(dt: number): void {
    if (this.curve) {
      this.curve.update(dt);
    }
  }
}
