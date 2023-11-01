
import { SpriteFlip } from "../../graphics/Sprite";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve } from "../../math/Curve";
import { SpriteId } from "../data/SpriteId";
import { AnimationComponent } from "./AnimationComponent";

export class ShootAnimation extends AnimationComponent {

    private curve: Curve;
    private sprite: SpritBatchController;
    private facingRight: boolean;

    initialize(sprite: SpritBatchController): void {
        this.sprite = sprite;
        this.curve = new Curve();
        const points: { p: number, t: number }[] = []

        this.facingRight = true;

        points.push({ p: 1, t: 0 });
        points.push({ p: 2, t: 150 });
        points.push({ p: 3, t: 300 });

        this.curve.points(points);
        let lastValue = -1;
        this.curve.onUpdate((value) => {

            // wait for the value to change
            if (value == lastValue) {
                return;
            }
            lastValue = value;

            this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip)
            if (value > 2) {
                this.sprite.setSprite('default');
            } else {
                this.sprite.setSprite('ground.shot.' + value);
            }

        });

    }

    stop(): ShootAnimation {
        this.sprite.activeSprite(SpriteId.Player);
        this.sprite.setSprite('default');
        this.curve.pause()
        return this;
    }

    start(facingRight: boolean): ShootAnimation {
        this.facingRight = facingRight;

        if (!this.sprite) {
            console.error('Need to call initialize() first.')
            return null;
        }


        // start moving
        this.curve.start(true);

        // set the first frame
        this.sprite.flip(this.facingRight ? SpriteFlip.None : SpriteFlip.XFlip)
        this.sprite.setSprite('ground.shot.1');

        return this;
    }

    update(dt: number): void {
        if (this.curve) {
            this.curve.update(dt);
        }
    }

}