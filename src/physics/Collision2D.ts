import rect from "../math/rect";


export class Collision2D {
    private _id: string;
    private _bounds: rect;

    public get bounds(): Readonly<rect> {
        return this._bounds;
    }

    public get id(): string {
        return this._id;
    }

    constructor(id: string, bounds?: Readonly<rect>) {
        this._id = id;
        this.setBounds(bounds);
    }

    set(left: number, width: number, top: number, height: number): void {
        this._bounds.set(left, width, top, height);
    }

    public setBounds(bounds?: Readonly<rect>): void {
        this._bounds = bounds.copy() ?? new rect();
    }

    public isColliding(other: Readonly<rect>): boolean {
        return this._bounds.intersects(other);
    }

}