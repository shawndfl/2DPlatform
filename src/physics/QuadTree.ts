import rect from "../math/rect";
import vec2 from "../math/vec2";
import vec4 from "../math/vec4";
import { Collision2D } from "./Collision2D";

export interface QuadTreeAnalytics {
    intersectionTests: number;
    nodesTested: number;
}

export class QuadTreeNode {
    bounds: rect;
    childCount: number;
    depth: number;
    collisions: Map<string, Collision2D>;
    topLeft: QuadTreeNode;
    topRight: QuadTreeNode;
    bottomLeft: QuadTreeNode;
    bottomRight: QuadTreeNode;

    /**
     * Min size of the tree
     */
    static maxDepth: number = 3;

    public get size(): number {
        return this.bounds.width;
    }

    constructor(offset: vec2, size: number, depth: number) {
        this.collisions = new Map<string, Collision2D>();
        this.bounds = new rect([offset.x, size, offset.y, size]);
        this.depth = depth;
        this.childCount = 0;
    }

    addCollision(collision: Collision2D, nodesFound: QuadTreeNode[]): boolean {

        // if the collision is not fully inside this node return null
        if (!this.bounds.intersects(collision.bounds)) {
            return false;
        }

        const halfSize = (this.size * .5);

        // no more quad trees just add this collision
        if (this.depth >= QuadTreeNode.maxDepth - 1) {
            this.collisions.set(collision.id, collision);
            this.childCount++;
            nodesFound.push(this);
            return true;
        }

        // add to children
        const midX = this.bounds.left + halfSize;
        const midY = this.bounds.top - halfSize;
        const x = this.bounds.left;
        const y = this.bounds.top;

        // allocate new nodes as 
        if (!this.topLeft) {
            this.topLeft = new QuadTreeNode(new vec2(x, y), halfSize, this.depth + 1);
        }
        if (!this.topRight) {
            this.topRight = new QuadTreeNode(new vec2(midX, y), halfSize, this.depth + 1);
        }
        if (!this.bottomLeft) {
            this.bottomLeft = new QuadTreeNode(new vec2(x, midY), halfSize, this.depth + 1);
        }
        if (!this.bottomRight) {
            this.bottomRight = new QuadTreeNode(new vec2(midX, midY), halfSize, this.depth + 1);
        }

        this.childCount = 0;
        // see if this fits in one of the child nodes
        if (this.topLeft.addCollision(collision, nodesFound)) {
            this.childCount++;
        }
        if (this.topRight.addCollision(collision, nodesFound)) {
            this.childCount++;
        }
        if (this.bottomLeft.addCollision(collision, nodesFound)) {
            this.childCount++;
        }
        if (this.bottomRight.addCollision(collision, nodesFound)) {
            this.childCount++;
        }

        return true;
    }

    clear(): void {
        this.bounds = new rect();
        this.depth = 0;
        this.collisions.clear();
        this.childCount = 0;
        this.bottomLeft = null;
        this.bottomRight = null;
        this.topLeft = null;
        this.topRight = null;
    }

    removeCollision(id: string): void {
        this.collisions.delete(id);
    }

    checkForCollision(other: Collision2D, results: Collision2D[], analytics?: QuadTreeAnalytics): boolean {

        if (analytics) {
            analytics.intersectionTests++;
            analytics.nodesTested++;
        }
        if (other.isCollidingRect(this.bounds)) {
            this.collisions.forEach((c) => {
                if (analytics) {
                    analytics.intersectionTests++;
                }
                if (c.isColliding(other)) {
                    results.push(c);
                }
            });

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
}

/**
 * Quad tree manages collision using QuadTreeNodes
 */
export class QuadTree {

    /**
     * Max size of the tree
     */
    size: number;

    /** Root node */
    root: QuadTreeNode;

    /**
     * Collision and the node they are mapped to
     */
    collisions: Map<string, QuadTreeNode[]>;

    constructor(size: number = 1000, maxDepth: number = 4) {
        QuadTreeNode.maxDepth = maxDepth;
        this.size = size;
        this.collisions = new Map<string, QuadTreeNode[]>();
        this.root = new QuadTreeNode(new vec2(0, this.size), this.size, 0);
    }

    /**
     * Add a collision
     * @param collision 
     */
    addCollision(collision: Collision2D): void {
        this.removeCollision(collision.id);

        const nodesFound: QuadTreeNode[] = [];
        const added = this.root.addCollision(collision, nodesFound);

        if (!added) {
            this.root.collisions.set(collision.id, collision);
            this.root.childCount++;
            nodesFound.push(this.root);
            console.warn('collision is outside bounds of the tree ' + collision.id);
        }

        // save the list of nodes that hold this collision
        this.collisions.set(collision.id, nodesFound);
    }

    /**
     * Removes a collision from all the nodes it is attached to
     * @param id 
     */
    removeCollision(id: string): void {
        const nodes = this.collisions.get(id);
        if (nodes) {
            nodes.forEach(n => n.removeCollision(id));
        }
    }

    /**
     * Check for collision
     * @param collision 
     * @param results 
     * @param analytics 
     * @returns 
     */
    checkForCollision(collision: Collision2D, results?: Collision2D[], analytics?: QuadTreeAnalytics): Collision2D[] {
        if (!results) {
            results = [];
        }
        this.root.checkForCollision(collision, results, analytics);
        return results
    }

}