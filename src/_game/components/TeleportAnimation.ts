import { ISprite } from '../../graphics/ISprite';
import { Curve, CurveType } from '../../math/Curve';

import { AnimationComponent } from './AnimationComponent';

export class TeleportAnimation extends AnimationComponent {
  private goingUp: boolean;
  private curve: Curve;
  private curveMove: Curve;
  private sprite: ISprite;
  private _running: boolean;
  private _isUp: boolean;

  public speed = 0.2; // how many seconds to move from top to bottom
  public animationSpeedScale = 1; // normal speed is 1 .5 is half time, 2 is twice as fast
  public get running(): boolean {
    return this._running;
  }

  public get isUp(): boolean {
    return this._isUp;
  }

  /**
   * The ground level + the height of the sprite.
   * This should be where the top corner of the
   * sprite rests
   */
  groundLevel: number = 300;
  xOffset: number = 10;

  initialize(sprite: ISprite): void {
    this._isUp = true;
    this.sprite = sprite;
    this.curveMove = new Curve();
    this.curve = new Curve();
    this._running = false;
    this.curveMove.curve(CurveType.linear);
    this.curveMove.onUpdate((value) => {
      this.sprite.left = this.xOffset;
      this.sprite.top = value + this.sprite.height;
    });
    this.curveMove.onDone((curve) => {
      if (this.goingUp) {
        this._isUp = true;
        this._running = false;
        // if we were going up then we are done here
        this.raiseOnDone();
      } else {
        // then start the animation
        this.curve.reverse(false).start(true);
      }
    });

    const points: { p: number; t: number }[] = [];

    const scale = 1 / this.animationSpeedScale;
    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 50 * scale });
    points.push({ p: 3, t: 100 * scale });
    points.push({ p: 4, t: 150 * scale });
    points.push({ p: 5, t: 200 * scale });
    points.push({ p: 6, t: 250 * scale });
    points.push({ p: 7, t: 300 * scale });
    points.push({ p: 8, t: 350 * scale });
    points.push({ p: 8, t: 400 * scale });

    this.curve.points(points);
    this.curve.onUpdate((value) => {
      // animation sprites
      if (value == 8) {
        this.sprite.spriteImage('default');
      } else {
        this.sprite.spriteImage('teleport.' + value);
      }
      this.sprite.left = this.xOffset;
      this.sprite.top = this.groundLevel + this.sprite.height;
    });
    this.curve.onDone((curve) => {
      if (!this.goingUp) {
        this._running = false;
        this.raiseOnDone();
      } else {
        this.curveMove.reverse(true).start(true);
      }
    });
  }

  start(goingUp: boolean): TeleportAnimation {
    this._isUp = false;
    this._running = true;
    const padding = 500;
    const maxHeight = this.eng.viewManager.top + padding;
    const distance = maxHeight + this.groundLevel;
    const t = distance * this.speed;
    this.curveMove.points([
      { p: maxHeight, t: 0 },
      { p: this.groundLevel, t },
    ]);

    if (!this.sprite) {
      console.error('Need to call initialize() first.');
      return null;
    }

    this.goingUp = goingUp;

    if (this.goingUp) {
      this.sprite.spriteImage('default');
      this.curveMove.pause();
      this.curve.reverse(true).start(true);
    } else {
      // start moving
      this.sprite.spriteImage('teleport.1');
      this.curve.pause();
      this.curveMove.reverse(false).start(true);
    }

    return this;
  }

  stop(): void {
    this.curve.pause();
    this.curveMove.pause();
    this._running = false;
  }

  update(dt: number): void {
    if (this.curve) {
      this.curve.update(dt);
    }
    if (this.curveMove) {
      this.curveMove.update(dt);
    }
  }
}
