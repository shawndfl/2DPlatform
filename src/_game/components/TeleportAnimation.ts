import { Component } from "../../components/Component";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve, CurveType } from "../../math/Curve";
import vec2 from "../../math/vec2";

export class TeleportAnimation extends Component {

    private _onDone: () => void;
    private goingUp: boolean;
    private curve: Curve;
    private curveMove: Curve;
    private sprite: SpritBatchController;


    groundLevel: number = 300;
    xOffset: number = 10;

    initialize(sprite: SpritBatchController): void {

        this.sprite = sprite;
        this.curveMove = new Curve();
        this.curve = new Curve();
        this.curveMove.curve(CurveType.linear);
        this.curveMove.onUpdate((value) => {
            // move
            this.sprite.setSpritePosition(this.xOffset, value);
        })
        this.curveMove.onDone((curve) => {

            if (this.goingUp) {
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

    }

    onDone(done: () => void): TeleportAnimation {
        this._onDone = done;
        return this;
    }

    start(goingUp: boolean): TeleportAnimation {

        const speed = 20 / 10;
        const distance = -100 + this.groundLevel;
        const t = distance * speed;
        this.curveMove.points([{ p: 900, t: 0 }, { p: this.groundLevel, t }]);

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

    update(dt: number): void {
        if (this.curve) {
            this.curve.update(dt);
        }
        if (this.curveMove) {
            this.curveMove.update(dt);
        }
    }

}