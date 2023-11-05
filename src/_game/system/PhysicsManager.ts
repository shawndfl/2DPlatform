import vec3 from "../../math/vec3";
import { GameComponent } from "../components/GameComponent";

/**
 * Holds forces
 */
export class PhysicsManager extends GameComponent {

    public gravity: vec3;
    public wind: vec3;

    initialize(): void {
        this.gravity = new vec3([0, -9.8, 0]);
        this.wind = new vec3();
    }
}