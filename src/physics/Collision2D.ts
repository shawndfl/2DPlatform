
import { TileComponent } from "../_game/tiles/TileComponent";
import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import rect from "../math/rect";
import vec4 from "../math/vec4";


export class Collision2D extends Component {
    private _id: string;
    private _bounds: rect;
    private _isColliding: boolean;
    public showCollision: boolean;
    public onCollision: (other: Collision2D) => void

    /**
     * The component this is attached to
     */
    public get tag(): Component {
        return this._tag;
    }

    public get isCollising(): boolean {
        return this._isColliding;
    }

    public get bounds(): Readonly<rect> {
        return this._bounds;
    }

    public get id(): string {
        return this._id;
    }

    constructor(eng: Engine, id: string, private _tag: Component, bounds?: Readonly<rect>) {
        super(eng);
        this._id = id;
        this.setBounds(bounds);
    }

    set(left: number, width: number, top: number, height: number): void {
        this._bounds.set(left, width, top, height);
    }

    setPos(left: number, top: number): void {
        this._bounds.set(left, this._bounds.width, top, this._bounds.height);
    }

    public setBounds(bounds?: Readonly<rect>): void {
        this._bounds = bounds.copy() ?? new rect();
    }

    /**
     * Used for bounds checking in quad trees
     * @param other 
     * @returns 
     */
    public isCollidingRect(other: Readonly<rect>): boolean {
        return this._bounds.intersects(other);
    }

    /**
     * Check collision with other colliders 
     * @param other 
     * @returns 
     */
    public isColliding(other: Collision2D): boolean {
        this._isColliding = this._bounds.intersects(other.bounds);
        if (this._isColliding) {
            if (this.onCollision) {
                this.onCollision(other);
            }

        }
        return this._isColliding;
    }

}