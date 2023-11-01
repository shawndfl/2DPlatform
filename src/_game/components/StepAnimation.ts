
import { SpriteFlip } from "../../graphics/Sprite";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { PlatformEngine } from "../PlatformEngine";
import { AnimationComponent } from "./AnimationComponent";

/**
 * Steps through frames of an animaion.
 */
export class StepAnimation extends AnimationComponent {
    private index: number;
    private currentSprite: string;
    public isFlipped: boolean;
    public frames = [
        'ground.shot.1',
        'ground.shot.2'
    ];
    private sprite: SpritBatchController;

    constructor(eng: PlatformEngine) {
        super(eng);
        this.index = 0;
        this.currentSprite = this.frames[this.index];

    }

    initialize(sprite: SpritBatchController): void {
        this.sprite = sprite;
        this.sprite.setSprite(this.currentSprite);
    }

    toggleFlipped(): boolean {
        this.isFlipped = !this.isFlipped;
        return this.isFlipped;
    }

    start(backwards: boolean): void {
        //NOP
    }

    stop(): void {
        //NOP
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

    update(dt: number): void {
        //NOP
    }
}