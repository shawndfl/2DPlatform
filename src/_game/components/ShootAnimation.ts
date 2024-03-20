import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { Curve } from '../../math/Curve';
import { SpriteId } from '../data/SpriteId';
import { AnimationComponent } from './AnimationComponent';

export class ShootAnimation extends AnimationComponent {
  private curve: Curve;
  private sprite: ISprite;
  private facingRight: boolean;

  initialize(sprite: ISprite): void {
    this.sprite = sprite;
    this.curve = new Curve();
    const points: { p: number; t: number }[] = [];

    this.facingRight = true;

    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 150 });
    points.push({ p: 3, t: 300 });

    this.curve.points(points);
    let lastValue = -1;

    this.curve
      .onUpdate((value) => {
        // wait for the value to change
        if (value == lastValue) {
          return;
        }
        lastValue = value;

        this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;
        if (value > 2) {
          this.sprite.spriteImage('default');
        } else {
          this.sprite.spriteImage('ground.shoot.' + value);
        }
      })
      .onDone((c) => {
        this.raiseOnDone();
      });
  }

  stop(): ShootAnimation {
    this.curve.pause();
    return this;
  }

  start(facingRight: boolean): ShootAnimation {
    this.facingRight = facingRight;

    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    // start moving
    this.curve.start(true);

    // set the first frame
    this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;
    this.sprite.spriteImage('ground.shoot.1');

    return this;
  }

  update(dt: number): void {
    if (this.curve) {
      this.curve.update(dt);
    }
  }
}
