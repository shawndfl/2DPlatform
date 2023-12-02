import { Component } from "../components/Component";
import rect from "../math/rect";
import vec2 from "../math/vec2";
import { Collision2D } from "./Collision2D";

export interface QuadTreeAnalytics {
    intersectionTests: number;
    nodesTested: number;
}

export class QuadTreeNode {
    bounds: rect;
    offset: vec2;
    size: number;
    mid: vec2;
    collisions: Collision2D[];
    topLeft: QuadTreeNode;
    topRight: QuadTreeNode;
    bottomLeft: QuadTreeNode;
    bottomRight: QuadTreeNode;

    constructor(offset: vec2, size: number) {
        this.offset = offset;
        this.size = size;
        this.bounds = new rect([this.offset.x, this.size, this.offset.y, this.size]);
        const halfSize = (this.size * .5);
        this.mid = new vec2(this.bounds.left + halfSize, this.bounds.top + halfSize);
    }

    addCollision(collision: Collision2D, minSize: number): boolean {

        // does not go here
        if (!collision.isCollidingRect(this.bounds)) {
            return false;
        }

        // no more quad trees just add this collision
        if (this.mid.x - this.offset.x < minSize) {
            if (!this.collisions) {
                this.collisions = [];
            }
            this.collisions.push(collision);
        }
        // add to children
        else {

            const halfSize = this.size * .5;
            if (!this.topLeft) {
                this.topLeft = new QuadTreeNode(this.offset.copy(), halfSize);
            }
            if (!this.topRight) {
                this.topRight = new QuadTreeNode(new vec2(this.offset.x + halfSize, this.offset.y), halfSize);
            }
            if (!this.bottomLeft) {
                this.bottomLeft = new QuadTreeNode(new vec2(this.offset.x, this.offset.y - halfSize), halfSize);
            }
            if (!this.bottomRight) {
                this.bottomRight = new QuadTreeNode(new vec2(this.offset.x + halfSize, this.offset.y - halfSize), halfSize);
            }
            this.topLeft.addCollision(collision, minSize);
            this.topRight.addCollision(collision, minSize);
            this.bottomLeft.addCollision(collision, minSize);
            this.bottomRight.addCollision(collision, minSize);
        }


    }

    checkForCollision(other: Collision2D, results: Collision2D[], analytics?: QuadTreeAnalytics): boolean {

        if (analytics) {
            analytics.intersectionTests++;
            analytics.nodesTested++;
        }
        if (other.isCollidingRect(this.bounds)) {
            if (this.collisions) {
                this.collisions.forEach((c) => {
                    if (analytics) {
                        analytics.intersectionTests++;
                    }
                    if (c.isColliding(other)) {
                        results.push(c);
                    }
                });
            }
            if (this.topLeft) {
                this.topLeft.checkForCollision(other, results, analytics);
            }
            if (this.topRight) {
                this.topRight.checkForCollision(other, results, analytics);
            }
            if (this.bottomLeft) {
                this.bottomLeft.checkForCollision(other, results, analytics);
            }
            if (this.bottomRight) {
                this.bottomRight.checkForCollision(other, results, analytics);
            }
        }
        return true;
    }

    printTree(depth: number): void {
        const padding = ''.padStart(depth, '_');
        let header = '|' + padding + 'size (' + this.size + ')';
        if (this.collisions) {
            header += ' #' + this.collisions.length;
        }
        console.debug(header);

        //console.debug('|' + padding + 'TR');
        if (this.topRight) {
            this.topRight.printTree(++depth);
        }
        //console.debug('|' + padding + 'TL');
        if (this.topLeft) {
            this.topLeft.printTree(++depth);
        }
        //console.debug('|' + padding + 'BR');
        if (this.bottomRight) {
            this.bottomRight.printTree(++depth);
        }
        //console.debug('|' + padding + 'BL');
        if (this.bottomLeft) {
            this.bottomLeft.printTree(++depth);
        }
    }

}

export class QuadTree {

    size: number;
    minSize: number;
    root: QuadTreeNode;

    collisions: Map<string, Collision2D>;

    constructor(size?: number, minSize?: number) {
        this.size = size ?? 10000;
        this.collisions = new Map<string, Collision2D>();
        this.minSize = minSize ?? 128;
        this.root = new QuadTreeNode(new vec2(0, this.size), this.size);
    }

    initialize(): void {

    }

    addCollision(collision: Collision2D): void {
        this.root.addCollision(collision, this.minSize);
    }

    checkForCollision(collision: Collision2D, results?: Collision2D[], analytics?: QuadTreeAnalytics): Collision2D[] {
        if (!results) {
            results = [];
        }
        this.root.checkForCollision(collision, results, analytics);
        return results
    }

    printTree(): void {
        this.root.printTree(0);
    }

    removeFromTree(id: string): void {

    }

    update(dt: number) {

    }
}