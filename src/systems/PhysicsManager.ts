import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import vec3 from "../math/vec3";
import { Collision2D } from "../physics/Collision2D";
import { QuadTree } from "../physics/QuadTree";
import { RidgeBody } from "../physics/RidgeBody";


/**
 * Holds forces
 */
export class PhysicsManager extends Component {

    public gravity: vec3;
    public wind: vec3;
    public quadTree: QuadTree;

    protected ridgeBodies: RidgeBody[];

    constructor(eng: Engine) {
        super(eng);
        this.gravity = new vec3([0, -9.8, 0]);
        this.wind = new vec3();
        this.quadTree = new QuadTree(this.eng);
    }

    initialize(): void {

    }

    addStatic(collision: Collision2D): void {
        this.quadTree.addCollision(collision);
    }

    addBody(body: RidgeBody): void {
        this.ridgeBodies.push(body);
    }


    update(dt: number): void {

    }
}