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
        this.quadTree = new QuadTree(10000, 512);
        this.ridgeBodies = [];
    }

    initialize(): void {

    }

    setCollision(collision: Collision2D): void {
        this.quadTree.addCollision(collision);
    }

    addBody(body: RidgeBody): void {
        this.ridgeBodies.push(body);
    }

    resolveCollisions(): void {

        this.ridgeBodies.forEach(source => {
            const results = this.quadTree.checkForCollision(source);

            //results.forEach((collision) => source.onCollision(collision))
        })
    }
    /*
        private checkScreenCollisionAndAdjust(): boolean {
    
            const bounds = this.screenBounds;
            let hitSomething = false;
            // check screen bounds
            if (bounds.left < this.eng.viewManager.left && this.facingLeft) {
                this.screenPosition.x = this.eng.viewManager.left;
                hitSomething = true;
            }
            if (bounds.right > this.eng.viewManager.right && this.facingRight) {
                this.screenPosition.x = this.eng.viewManager.right - this.collision.bounds.width;
                hitSomething = true;
            }
            if (bounds.top > this.eng.viewManager.top) {
                this.screenPosition.y = this.eng.viewManager.top;
                hitSomething = true;
            }
            if (bounds.bottom < 0) {
                this.screenPosition.y = 0;
                hitSomething = true;
            }
    
            return hitSomething;
        }
    */

    update(dt: number): void {
        for (let i = 0; i < this.ridgeBodies.length; i++) {
            this.ridgeBodies[i].update(dt);
        }
        this.resolveCollisions();
    }
}