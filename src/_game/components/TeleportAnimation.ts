import { Component } from "../../core/Component";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve, CurveType } from "../../math/Curve";

export class TeleportAnimation extends Component {

    private _onDone: () => void;
    private goingUp: boolean;
    private curve: Curve;
    private curveMove: Curve;
    private sprite: SpritBatchController;

    initialize(sprite: SpritBatchController): void {
        this.sprite = sprite;
    }

    onDone(done: () => void): TeleportAnimation {
        this._onDone = done;
        return this;
    }

    start(goingUp: boolean): TeleportAnimation {

        if (!this.sprite) {
            console.error('Need to call initialize() first.')
            return null;
        }

        this.goingUp = goingUp;

        this.curveMove = new Curve();
        this.curveMove.curve(CurveType.linear);
        this.curveMove.points([{ p: 0, t: 0 }, { p: 400, t: 200 }]);
        this.curveMove.onUpdate((value) => {
            // move
            this.sprite.setSpritePosition(10, this.eng.height - this.sprite.spriteHeight() - value);
        })
        this.curveMove.onDone((curve) => {

            if (this.goingUp) {
                this.curveMove.reverse(false).start(true);

                // if we were going up then we are done here
                if (this._onDone) {
                    this._onDone();
                }
            } else {

                // then start the animation
                this.curve.reverse(false).start(true);
            }
        })

        this.curve = new Curve();
        const points: { p: number, t: number }[] = []

        points.push({ p: 1, t: 0 });
        points.push({ p: 2, t: 100 });
        points.push({ p: 3, t: 250 });
        points.push({ p: 4, t: 300 });
        points.push({ p: 5, t: 350 });
        points.push({ p: 6, t: 400 });
        points.push({ p: 7, t: 450 });
        points.push({ p: 8, t: 500 });
        points.push({ p: 8, t: 1000 });

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
                if (this._onDone) {
                    this._onDone();
                }
            } else {
                this.curveMove.reverse(true).start(true);
            }
        });

        if (this.goingUp) {
            this.curve.reverse(true).start(true);
        } else {
            // start moving
            this.curveMove.start(true);
        }

        return this;
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