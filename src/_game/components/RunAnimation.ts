import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { Curve } from '../../math/Curve';
import { AnimationComponent } from './AnimationComponent';

export class RunAnimation extends AnimationComponent {
  private curve: Curve;
  private sprite: ISprite;
  private firstOne: boolean;
  private facingRight: boolean;
  private isShooting: boolean;
  readonly shootingDelay: number = 200;
  private shootingTimer: number = 200;
  private defaultHeight: number;

  public touchingFloor: boolean;

  initialize(sprite: ISprite): void {
    this.sprite = sprite;
    this.curve = new Curve();
    const points: { p: number; t: number }[] = [];

    this.defaultHeight = this.sprite.height;

    this.touchingFloor = true;
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
      this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;

      if (this.touchingFloor) {
        if (this.isShooting) {
          this.sprite.spriteImage('run.shoot.' + value);
        } else {
          this.sprite.spriteImage('run.' + value);
        }
      } else {
        this.sprite.spriteImage('jump.5');
      }
      if (value >= 10) {
        this.firstOne = false;
      }
    });
  }

  stop(): RunAnimation {
    this.curve.pause();
    return this;
  }

  shooting(): void {
    this.isShooting = true;
    this.shootingTimer = this.shootingDelay;
  }

  start(facingRight: boolean): RunAnimation {
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
      this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;

      if (this.touchingFloor) {
        this.sprite.spriteImage('run.1');
      } else {
        this.sprite.spriteImage('jump.5');
      }
    }
    return this;
  }

  update(dt: number): void {
    if (this.curve) {
      this.curve.update(dt);
    }

    if (this.isShooting) {
      this.shootingTimer -= dt;
      if (this.shootingTimer <= 0) {
        this.isShooting = false;
      }
    }
  }
}
