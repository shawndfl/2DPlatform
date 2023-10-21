import { FrameController } from "./FrameController";

/**
 * The main entry point for the animation editor
 */
export class AnimationEditor {
    image: HTMLImageElement;
    root: HTMLElement;

    readonly frameController: FrameController;

    /** time tracking variables */
    private previousTimeStamp: number;

    constructor() {
        this.frameController = new FrameController(this);
    }

    async initialize(root: HTMLElement): Promise<void> {
        this.root = root;
        await this.frameController.initialize()

        window.requestAnimationFrame(this.frame.bind(this));
    }

    frame(timestamp: number) {
        // save the start time
        if (this.previousTimeStamp === undefined) {
            this.previousTimeStamp = timestamp;
        }

        // calculate the elapsed
        const elapsed = timestamp - this.previousTimeStamp;

        // update the scene
        this.update(elapsed);

        // request a new frame
        this.previousTimeStamp = timestamp;
        window.requestAnimationFrame(this.frame.bind(this));
    }

    update(dt: number) {

        this.frameController.update(dt);
    }
}