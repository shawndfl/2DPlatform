import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import rect from "../math/rect";


export class Collision2D extends Component {
    private _id: string;
    private _bounds: rect;

    public get bounds(): Readonly<rect> {
        return this._bounds;
    }

    public get id(): string {
        return this._id;
    }

    constructor(eng: Engine, id: string, bounds?: Readonly<rect>) {
        super(eng);
        this._id = id;
        this.setBounds(bounds);
    }

    public setBounds(bounds?: Readonly<rect>): void {
        this._bounds = bounds.copy() ?? new rect();
        this.eng.physicsManager.addStatic(this);
    }

    public isColliding(other: rect): boolean {
        return this._bounds.intersects(other);
    }

}