import frame1 from '../assets/frames/001-000.png'
import frame2 from '../assets/frames/001-001.png'
/**
 * The main entry point for the animation editor
 */
export class AnimationEditor {
    image: HTMLImageElement;
    frames = [frame1, frame2]

    /** time tracking variables */
    private previousTimeStamp: number;

    initialize(root: HTMLElement): void {
        this.image = new Image();
        this.image.src = frame1;
        root.append(this.image);
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

    counter = 0;
    frameIndex = 0;
    update(dt: number) {
        this.counter += dt;

        if (this.counter > 1000) {
            this.frameIndex++;
            this.image.src = this.frames[this.frameIndex % 2];
            this.counter = 0;
        }
    }
}