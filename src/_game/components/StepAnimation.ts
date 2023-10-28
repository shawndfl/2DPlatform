import { SpriteFlip } from "../../graphics/Sprite";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";

/**
 * Steps through frames of an animaion.
 */
export class StepAnimation {
    private index: number;
    private currentSprite: string;
    public isFlipped: boolean;

    constructor(public sprite: SpritBaseController, public frames: string[]) {
        this.index = 0;
        this.currentSprite = this.frames[this.index];
        this.sprite.setSprite(this.currentSprite);
    }

    stepForward(): void {
        this.index++;
        if (this.index >= this.frames.length) {
            this.index = 0;
        }
        this.currentSprite = this.frames[this.index];
        console.debug('Sprite Step: ', this.currentSprite);

        this.sprite.flip(this.isFlipped ? SpriteFlip.XFlip : SpriteFlip.None).setSprite(this.currentSprite);
    }

    stepBackwards(): void {
        this.index--;
        if (this.index < 0) {
            this.index = this.frames.length - 1;
        }
        this.currentSprite = this.frames[this.index];
        console.debug('Sprite Step: ', this.currentSprite);

        this.sprite.flip(this.isFlipped ? SpriteFlip.XFlip : SpriteFlip.None).setSprite(this.currentSprite);
    }
}