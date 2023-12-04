
import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import rect from "../math/rect";
import vec3 from "../math/vec3";
import { Collision2D } from "./Collision2D";

export class RidgeBody extends Collision2D {
    public position: vec3;
    public acceleration: vec3;
    public velocity: vec3;
    public force: vec3;
    public mass: number;
    public active: boolean

    public maxVelocity: vec3;

    private newPos: vec3;
    private newVel: vec3;

    onPositionChange: (newPosition: vec3) => void;

    constructor(eng: Engine, id: string, tag: Component, bounds?: Readonly<rect>) {
        super(eng, id, tag, bounds);
        this.position = new vec3();
        this.velocity = new vec3();
        this.acceleration = new vec3
        this.maxVelocity = new vec3([1000, 1000, 1000]);
        this.force = new vec3();
        this.mass = 10;
        this.active = true;
    }

    private temp = new vec3();
    update(dt: number) {
        if (this.active) {
            // get a copy of the position and velocity
            this.newPos = this.position.copy(this.newPos);
            this.newVel = this.velocity.copy(this.newVel);


            // apply acceleration and velocity
            if (this.newVel.length() > 0) {
                console.debug('moving');
            }
            this.newVel.add(this.acceleration.scale(dt, this.temp));
            this.newPos.add(this.newVel.scale(dt, this.temp));

            // update position and velocity
            this.newPos.copy(this.position);
            this.newVel.copy(this.velocity);

            if (this.onPositionChange) {
                this.onPositionChange(this.newPos);
            }
        }
    }

}