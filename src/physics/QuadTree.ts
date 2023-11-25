import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import rect from "../math/rect";
import { Collision2D } from "./Collision2D";


export class QuadTreeNode extends Component {
    bounds: rect;
    collisions: Collision2D[] = [];

    addCollision(collision: Collision2D): void {
        this.collisions.push(collision);
    }

}

export class QuadTree extends Component {

    bounds: rect;
    maxDepth: number = 5;
    topLeft: QuadTreeNode;
    topRight: QuadTreeNode;
    bottomLeft: QuadTreeNode;
    bottomRight: QuadTreeNode;

    collisions: Map<string, Collision2D>;

    constructor(eng: Engine) {
        super(eng);
        this.collisions = new Map<string, Collision2D>();
    }

    initialize(): void {

    }

    addCollision(collision: Collision2D): void {
        if (this.collisions.has(collision.id)) {
            //remove from tree.
        }
        this.collisions.set(collision.id, collision);

        //todo add

    }

    removeFromTree(id: string): void {

    }

    update(dt: number) {

    }
}