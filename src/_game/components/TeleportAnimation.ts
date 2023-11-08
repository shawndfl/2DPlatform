import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve, CurveType } from "../../math/Curve";

import { AnimationComponent } from "./AnimationComponent";

export class TeleportAnimation extends AnimationComponent {

    private _onDone: () => void;
    private goingUp: boolean;
    private curve: Curve;
    private curveMove: Curve;
    private sprite: SpritBatchController;
    private _running: boolean;
    private _isUp: boolean;

    public get running(): boolean {
        return this._running;
    }

    public get isUp(): boolean {
        return this._isUp;
    }

    groundLevel: number = 300;
    xOffset: number = 10;

    initialize(sprite: SpritBatchController): void {
        this._isUp = true;
        this.sprite = sprite;
        this.curveMove = new Curve();
        this.curve = new Curve();
        this._running = false;
        this.curveMove.curve(CurveType.linear);
        this.curveMove.onUpdate((value) => {
            // move
            this.sprite.setSpritePosition(this.xOffset, value);
        })
        this.curveMove.onDone((curve) => {

            if (this.goingUp) {
                this._isUp = true;
                this._running = false;
                // if we were going up then we are done here
                if (this._onDone) {
                    this._onDone();
                }
            } else {

                // then start the animation
                this.curve.reverse(false).start(true);
            }
        })

        const points: { p: number, t: number }[] = []

        points.push({ p: 1, t: 0 });
        points.push({ p: 2, t: 50 });
        points.push({ p: 3, t: 100 });
        points.push({ p: 4, t: 150 });
        points.push({ p: 5, t: 200 });
        points.push({ p: 6, t: 250 });
        points.push({ p: 7, t: 300 });
        points.push({ p: 8, t: 350 });
        points.push({ p: 8, t: 400 });

        this.curve.points(points);
        this.curve.onUpdate((value) => {
            // animation sprites
            if (value == 8) {
                this.sprite.setSprite('default');
            } else {
                this.sprite.setSprite('teleport.' + value);
            }
        });
        this.curve.onDone((curve) => {
            if (!this.goingUp) {
                this._running = false;
                if (this._onDone) {
                    this._onDone();
                }
            } else {
                this.curveMove.reverse(true).start(true);
            }
        });

    }

    onDone(done: () => void): TeleportAnimation {
        this._onDone = done;
        return this;
    }

    start(goingUp: boolean): TeleportAnimation {

        this._isUp = false;
        this._running = true;
        const speed = .2;
        const padding = 10;
        const maxHeight = this.eng.viewManager.top + padding;
        const distance = maxHeight + this.groundLevel;
        const t = distance * speed;
        this.curveMove.points([{ p: maxHeight, t: 0 }, { p: this.groundLevel, t }]);

        if (!this.sprite) {
            console.error('Need to call initialize() first.')
            return null;
        }

        this.goingUp = goingUp;

        if (this.goingUp) {
            this.sprite.setSprite('default');
            this.curveMove.pause();
            this.curve.reverse(true).start(true);
        } else {
            // start moving
            this.sprite.setSprite('teleport.1');
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