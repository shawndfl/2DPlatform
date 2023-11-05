import mat2 from "../../math/mat2";
import rect from "../../math/rect";
import { PlatformEngine } from "../PlatformEngine";
import { GameComponent } from "../components/GameComponent";

export class Collision2D extends GameComponent {

    localBounds: rect;
    transform: mat2;
    worldBounds: rect;

    constructor(eng: PlatformEngine, localBounds?: rect, transform?: mat2) {
        super(eng);
        if (!localBounds) {
            localBounds = new rect();
        }

        if (!transform) {
            transform = new mat2();
        }

        this.localBounds = localBounds;
        this.transform = transform;

        this.calculate();
    }

    private calculate(): void {

    }
}