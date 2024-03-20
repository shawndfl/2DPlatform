import { ISprite, SpriteFlip } from '../../graphics/ISprite';
import { Curve, CurveType } from '../../math/Curve';
import { AnimationComponent } from './AnimationComponent';

export class HitAnimation extends AnimationComponent {
  private curve: Curve;
  private curveFade: Curve;
  private sprite: ISprite;
  private facingRight: boolean;
  private _initialTop: number;
  private _defaultHeight: number;

  public get initialTop(): number {
    return this._initialTop;
  }

  public get isRunning(): boolean {
    return this.curve.isRunning();
  }

  initialize(sprite: ISprite, delayAfterHit: number = 0): void {
    this.sprite = sprite;
    this.facingRight = true;

    // animation
    this.curve = new Curve();

    const points: { p: number; t: number }[] = [];

    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 100 });
    points.push({ p: 3, t: 200 });
    points.push({ p: 3, t: 300 + delayAfterHit });
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
        this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;

        this.sprite.spriteImage('hit.' + value);

        const heightDiff = this.sprite.height - this._defaultHeight;
        this.sprite.top = this._initialTop + heightDiff * 2;
      })
      .onDone((c) => {
        this.sprite.top = this._initialTop;
        this.raiseOnDone();
      });

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
    this._initialTop = this.sprite.top;

    // save the default height
    this.sprite.spriteImage('default');
    this._defaultHeight = this.sprite.height;

    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    if (!this.curve.isRunning()) {
      // start moving
      this.curve.start(true);

      // set the first frame
      this.sprite.flipDirection = this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip;
      this.sprite.spriteImage('hit.1');
    }
    return this;
  }

  stop(): HitAnimation {
    this.curve.pause();
    return this;
  }
  update(dt: number): void {
    this.curve.update(dt);
  }
}
