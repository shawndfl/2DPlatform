import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { GameComponent } from "./GameComponent";


export abstract class AnimationComponent extends GameComponent {


    abstract initialize(sprite: SpritBatchController): void;

    abstract start(backwards: boolean): void;

    abstract stop(): void;

    abstract update(dt: number): void;
}