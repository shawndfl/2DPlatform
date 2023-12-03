import rect from "../math/rect";
import vec2 from "../math/vec2";
import { Collision2D } from "./Collision2D";

export interface QuadTreeAnalytics {
    intersectionTests: number;
    nodesTested: number;
}

export class QuadTreeNode {
    bounds: rect;
    collisions: Map<string, Collision2D>;
    topLeft: QuadTreeNode;
    topRight: QuadTreeNode;
    bottomLeft: QuadTreeNode;
    bottomRight: QuadTreeNode;

    public get size(): number {
        return this.bounds.width;
    }

    constructor(offset: vec2, size: number) {
        this.collisions = new Map<string, Collision2D>();
        this.bounds = new rect([offset.x, size, offset.y, size]);
    }

    addCollision(collision: Collision2D, minSize: number): QuadTreeNode {

        // does not collide with this node
        if (!collision.isCollidingRect(this.bounds)) {
            return null;
        }

        const halfSize = (this.size * .5);

        // no more quad trees just add this collision
        if (halfSize < minSize) {
            this.collisions.set(collision.id, collision);
            return this;
        }
        // add to children
        else {

            const midX = this.bounds.left + halfSize;
            const midY = this.bounds.top - halfSize;
            const x = this.bounds.left;
            const y = this.bounds.top;

            // allocate new nodes as 
            if (!this.topLeft) {
                this.topLeft = new QuadTreeNode(new vec2(x, y), halfSize);
            }
            if (!this.topRight) {
                this.topRight = new QuadTreeNode(new vec2(midX, y), halfSize);
            }
            if (!this.bottomLeft) {
                this.bottomLeft = new QuadTreeNode(new vec2(x, midY), halfSize);
            }
            if (!this.bottomRight) {
                this.bottomRight = new QuadTreeNode(new vec2(midX, midY), halfSize);
            }

            // see if this fits in one of the child nodes
            let node: QuadTreeNode;
            if (node = this.topLeft.addCollision(collision, minSize)) {
                return node;
            }
            if (node = this.topRight.addCollision(collision, minSize)) {
                return node;
            }
            if (node = this.bottomLeft.addCollision(collision, minSize)) {
                return node
            }
            if (node = this.bottomRight.addCollision(collision, minSize)) {
                return node;
            }

            // If this collision is encapsulates then add the collision
            // to this node. At this point is does not fit in any child node 
            if (this.bounds.encapsulates(collision.bounds)) {
                this.collisions.set(collision.id, collision);
                return this;
            }
        }
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

    /**
     * Prints the node
     * @param depth 
     */
    printTree(depth: number): void {
        const padding = ''.padStart(depth, '_');
        let header = '|' + padding + 'size (' + this.size + ')';
        if (this.collisions) {
            header += ' #' + this.collisions.size;
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

/**
 * Quad tree manages collision using QuadTreeNodes
 */
export class QuadTree {

    /**
     * Max size of the tree
     */
    size: number;

    /**
     * Min size of the tree
     */
    minSize: number;

    /** Root node */
    root: QuadTreeNode;

    /**
     * Collision and the node they are mapped to
     */
    collisions: Map<string, QuadTreeNode>;

    constructor(size?: number, minSize?: number) {
        this.size = size ?? 10000;
        this.collisions = new Map<string, QuadTreeNode>();
        this.minSize = minSize ?? 128;
        this.root = new QuadTreeNode(new vec2(0, this.size), this.size);
    }

    /**
     * Add a collision
     * @param collision 
     */
    addCollision(collision: Collision2D): void {
        this.removeCollision(collision.id);

        const quadTree = this.root.addCollision(collision, this.minSize);
        if (quadTree) {
            this.collisions.set(collision.id, quadTree);
        }
    }

    /**
     * Removes a collision from the node it is attached to
     * @param id 
     */
    removeCollision(id: string): void {
        const node = this.collisions.get(id);
        if (node) {
            node.removeCollision(id);
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

    /**
     * Print the tree
     */
    printTree(): void {
        this.root.printTree(0);
    }

}