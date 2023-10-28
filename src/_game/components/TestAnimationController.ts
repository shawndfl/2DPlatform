import { InputState } from "../../core/InputHandler";
import { UserAction } from "../../core/UserAction";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { TextureAssest } from "../system/GameAssetManager";
import { StepAnimation } from "./StepAnimation";
import { PlatformEngine } from "../PlatformEngine";
import { TileComponent } from "../tiles/TileComponent";
import { SpritController } from "../../graphics/SpriteController";

export enum Direction {
    Right,
    Left
}

export class TestAnimationController extends TileComponent {

    private sprite: SpritController;
    private stepAnimation: StepAnimation;
    private frames = [
        'ground.shot.1',
        'ground.shot.2'
    ]
    /*
    private frames = [
        'run.2',
        'run.3',
        'run.4',
        'run.5',
        'run.6',
        'run.7',
        'run.8',
        'run.9',
        'run.10',
    ]
*/
    public get spriteController(): SpritBaseController {
        return this.sprite;
    }

    constructor(eng: PlatformEngine) {
        super(eng.groundManager, { i: 0, j: 0, k: 0, options: [], spriteName: 'default', tileClass: 'PlayerController' });
        this.sprite = new SpritController(eng);
    }

    initialize(): void {

        this.stepAnimation = new StepAnimation(this.sprite, this.frames);
        const spriteData = this.eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(spriteData.texture, spriteData.data);
        this.setTilePosition(3, 9, 0);

        this.sprite.setSprite('default');
        this.sprite.scale(2.0);
    }

    handleUserAction(state: InputState): boolean {
        if (state.isDown(UserAction.Right)) {
            return true;
        }
        if (state.isDown(UserAction.Left)) {
            return true;
        }
        if (state.isReleased(UserAction.Right)) {

            this.stepAnimation.stepForward();

            return true;
        }
        if (state.isReleased(UserAction.Left)) {
            this.stepAnimation.stepBackwards();
            return true;
        }

        if (state.isReleased(UserAction.Up)) {
            this.stepAnimation.toggleFlipped();
        }
        if (state.isReleased(UserAction.Down)) {

        }
        return false;
    }

    run(dt: number): void {

    }

    update(dt: number): void {
        if (this.stepAnimation) {
            this.sprite.update(dt);
            this.run(dt);
        }
    }

}
