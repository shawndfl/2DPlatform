import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve, CurveType } from "../../math/Curve";
import vec2 from "../../math/vec2";
import { AnimationComponent } from "./AnimationComponent";


export class JumpAnimation extends AnimationComponent {

    private curve: Curve;
    private sprite: SpritBatchController;

    xOffset: number;
    groundLevel: number;
    height: number;

    initialize(sprite: SpritBatchController): void {
        this.sprite = sprite;
        this.curve = new Curve();
        const points: { p: number, t: number }[] = []
        points.push({ p: 1, t: 0 });
        points.push({ p: 2, t: 50 });
        points.push({ p: 3, t: 100 });
        points.push({ p: 4, t: 150 });
        points.push({ p: 5, t: 200 });
        points.push({ p: 6, t: 250 });

        this.curve.points(points);
        let lastValue = -1;
        this.curve.onUpdate((value) => {

            // wait for the value to change
            if (value == lastValue) {
                return;
            }
            lastValue = value;

            // animation sprites
            value++;
            value = value > 10 ? 2 : value;
            // this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip)
            //this.sprite.setSprite('jump.' + value);

            //if (value >= 10) {
            //    this.firstOne = false;
            // }

        });
    }

    start(forward: boolean = true): void {

    }
    stop(): void {
    }
    update(dt: number): void {
        if (this.curve) {
            this.curve.update(dt);
        }
    }


}