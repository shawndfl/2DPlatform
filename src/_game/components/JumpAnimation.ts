import { ISprite, SpriteFlip } from '../../graphics/ISprite';

import { Curve, CurveType } from '../../math/Curve';
import vec2 from '../../math/vec2';
import { AnimationComponent } from './AnimationComponent';

export class JumpAnimation extends AnimationComponent {
  private curve: Curve;
  private sprite: ISprite;
  private facingRight: boolean;

  xOffset: number;
  groundLevel: number;
  height: number;

  set onDone(value: (curve: Curve) => void) {
    this.curve.onDone(value);
  }

  initialize(sprite: ISprite): void {
    this.sprite = sprite;
    this.curve = new Curve();
    const points: { p: number; t: number }[] = [];
    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 100 });
    points.push({ p: 3, t: 150 });
    points.push({ p: 4, t: 200 });
    points.push({ p: 4, t: 250 });

    this.curve.points(points);
    let lastValue = -1;
    this.curve.onUpdate((value) => {
      // wait for the value to change
      if (value == lastValue) {
        return;
      }
      lastValue = value;

      // animation sprites
      this.sprite.flipDirection = this.facingRight
        ? SpriteFlip.None
        : SpriteFlip.XFlip;
      this.sprite.spriteImage('jump.' + value);
    });
  }

  start(facingRight: boolean = true): void {
    this.facingRight = facingRight;

    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    this.curve.start(true);

    // set the first frame
    this.sprite.flipDirection = this.facingRight
      ? SpriteFlip.None
      : SpriteFlip.XFlip;

    this.sprite.spriteImage('jump.1');
  }

  stop(): void {}
  update(dt: number): void {
    if (this.curve) {
      this.curve.update(dt);
    }
  }
}
