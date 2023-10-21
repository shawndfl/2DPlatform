import { Component } from "../core/Component";
import { Engine } from "../core/Engine";
import { Curve } from "../math/Curve";

export enum AnimationEvent {
    Sprite,
    Event,
}

export interface Frame {
    type: AnimationEvent,
    value: string,
    time: number;
}

export interface Animation {
    name: string;
    frames: Frame[];
}

export interface AnimationOptions {
    backwards: boolean;
    onDone: () => void;
    onEvent: (event: string, frame: Frame) => void;
}

export class AnimationComponent extends Component {

    private curve: Curve;
    private animations: Animation[];
    constructor(eng: Engine) {
        super(eng);
        this.curve = new Curve();

    }

    initialize(animations: Animation[]) {
        this.animations = animations;
    }

    start(name: string, options: AnimationOptions) {

        const frames = this.animations.filter((a) => a.name == name)[0]?.frames;
        if (!frames) {
            console.error('Cannot find animation ', name);
        }
        const points: { p: number, t: number }[] = [];
        for (let i = 0; i < frames.length; i++) {
            points.push({ p: i, t: frames[i].time });
        }

        this.curve.points(points);
        this.curve.start(true, options.onDone);
    }

    update(dt: number) {

    }
}