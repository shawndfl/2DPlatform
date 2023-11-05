import vec3 from "../../math/vec3";
import { PlatformEngine } from "../PlatformEngine";
import { GameComponent } from "../components/GameComponent";

export class RidgeBody extends GameComponent {
    public position: vec3;
    public acceleration: vec3;
    public velocity: vec3;
    public force: vec3;
    public mass: number;

    public maxVelocity: vec3;

    private newPos: vec3;
    private newVel: vec3;

    constructor(eng: PlatformEngine) {
        super(eng);
        this.position = new vec3();
        this.velocity = new vec3();
        this.acceleration = new vec3
        this.maxVelocity = new vec3([1000, 1000, 1000]);
        this.force = new vec3();
        this.mass = 10;
    }

    update(dt: number) {
        this.newPos = this.position.copy(this.newPos);
        this.newVel = this.velocity.copy(this.newVel);

        this.force.scale(1.0 / this.mass, this.acceleration);

        this.acceleration.scale(dt, this.newVel);
        this.newVel.scale(dt, this.newPos);

        console.debug('pos ' + this.newPos + ' vel ' + this.newVel);
    }

}