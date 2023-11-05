import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve, CurveType } from "../../math/Curve";
import { AnimationComponent } from "./AnimationComponent";


export class JumpAnimation extends AnimationComponent {

    private curveMove: Curve;
    private curve: Curve;
    private sprite: SpritBatchController;

    xOffset: number;
    groundLevel: number;
    height: number;

    initialize(sprite: SpritBatchController): void {
        this.sprite = sprite;
        this.curveMove = new Curve();
        this.curveMove.curve(CurveType.linear);
        this.curveMove.onUpdate((value) => {
            // move
            this.sprite.setSpritePosition(this.xOffset, value);
        })
    }
    start(forward: boolean = true): void {
        this.curveMove.points([
            { p: this.groundLevel, t: 0 },
            { p: this.height, t: 1500 }
        ])
        if (this.curveMove) {
            this.curveMove.start(true);
        }
    }
    stop(): void {
        if (this.curveMove) {
            this.curveMove.pause();
        }
    }
    update(dt: number): void {
        if (this.curveMove) {
            this.curveMove.update(dt);
        }
    }


}