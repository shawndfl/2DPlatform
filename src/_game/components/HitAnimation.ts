import { SpriteFlip } from '../../graphics/ISprite';
import { SpritBatchController } from '../../graphics/SpriteBatchController';
import { Curve, CurveType } from '../../math/Curve';
import { AnimationComponent } from './AnimationComponent';

export class HitAnimation extends AnimationComponent {
  private curve: Curve;
  private curveFade: Curve;
  private sprite: SpritBatchController;
  private facingRight: boolean;

  initialize(sprite: SpritBatchController): void {
    this.sprite = sprite;
    this.facingRight = true;

    // animation
    this.curve = new Curve();
    const points: { p: number; t: number }[] = [];

    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 100 });
    points.push({ p: 3, t: 200 });
    this.curve.points(points);

    let lastValue = -1;
    this.curve
      .onUpdate((value) => {
        // wait for the value to change
        if (value == lastValue) {
          return;
        }
        lastValue = value;

        // animation sprites
        value = value > 3 ? 1 : value;
        this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip);
        if (value < 3) {
          this.sprite.setSprite('hit.' + value);
        } else {
          this.sprite.setSprite('default');
        }
      })
      .onDone((value) => {});

    // TODO fade when spriteInstanceController can be used
    this.curveFade = new Curve();
    this.curveFade.curve(CurveType.linear);
    this.curveFade.points([
      { p: 1, t: 0 },
      { p: 0, t: 1000 },
    ]);

    this.curveFade.onUpdate((value) => {
      //this.sprite.se
    });
  }

  start(facingRight: boolean): HitAnimation {
    this.facingRight = facingRight;

    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    if (!this.curve.isRunning()) {
      // start moving
      this.curve.start(true);

      // set the first frame
      this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip);
      this.sprite.setSprite('hit.1');
    }
    return this;
  }

  stop(): HitAnimation {
    this.sprite.setSprite('default');
    this.curve.pause();
    return this;
  }
  update(dt: number): void {
    this.curve.update(dt);
  }
}
