import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { Curve, CurveType } from '../../math/Curve';
import { AnimationComponent } from './AnimationComponent';

export class RecoveryAnimation extends AnimationComponent {
  private curve: Curve;
  private sprite: ISprite;

  public get isRunning(): boolean {
    return this.curve.isRunning();
  }

  initialize(sprite: ISprite): void {
    this.sprite = sprite;

    // animation
    this.curve = new Curve();

    const points: { p: number; t: number }[] = [];

    for (let i = 0; i < 25; i++) {
      const mod = i % 4;
      points.push({ p: mod / 4, t: i * 50 });
    }

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
        this.sprite.alpha = value;
      })
      .onDone((c) => {
        this.sprite.alpha = 1;
        this.raiseOnDone();
      });
  }

  start(): RecoveryAnimation {
    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    if (!this.curve.isRunning()) {
      // start moving
      this.curve.start(true);
    }
    return this;
  }

  stop(): RecoveryAnimation {
    this.curve.pause();
    this.sprite.alpha = 1;
    return this;
  }
  update(dt: number): void {
    this.curve.update(dt);
  }
}
