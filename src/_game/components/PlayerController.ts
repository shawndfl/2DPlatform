import { stat } from "fs";
import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { InputState } from "../../core/InputHandler";
import { UserAction } from "../../core/UserAction";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TextureAssest } from "../system/GameAssetManager";
import { TeleportAnimation } from "./TeleportAnimation";
import { WalkAnimation } from "./WalkAnimation";
import { SpriteFlip } from "../../graphics/Sprite";
import vec2 from "../../math/vec2";
import { StepAnimation } from "./StepAnimation";

export enum Direction {
    Right,
    Left
}

export class PlayerController extends Component {

    private active: boolean;
    private sprite: SpritBatchController;
    private stepAnimation: StepAnimation;
    private position: vec2;
    private running: boolean;
    private direction: Direction;
    teleport: TeleportAnimation;
    walk: WalkAnimation;

    constructor(eng: Engine) {
        super(eng);
        this.sprite = new SpritBatchController(eng);
        this.teleport = new TeleportAnimation(this.eng);
        this.walk = new WalkAnimation(this.eng);

        this.position = new vec2(250, 200);
        this.direction = Direction.Right;
        this.running = false;

        this.stepAnimation = new StepAnimation(this.sprite, [
            'run.2',
            'run.3',
            'run.4',
            'run.5',
            'run.6',
            'run.7',
            'run.8',
            'run.9',
            'run.10',
        ])
    }

    initialize(): void {

        const spriteData = this.eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(spriteData.texture, spriteData.data);

        this.sprite.activeSprite('player');
        this.sprite.setSprite('teleport.1');
        this.sprite.scale(2.0);
        this.sprite.setSpritePosition(this.position.x, this.position.y);

        this.teleport.initialize(this.sprite);
        this.walk.initialize(this.sprite);
        // setup the teleport animation
        let goingup = false;

        this.teleport.groundLevel = this.position.y;
        this.teleport.xOffset = this.position.x;
        this.teleport.start(goingup).onDone(() => {
            this.active = true;
        })
    }

    handleUserAction(state: InputState): boolean {
        const step = false;

        if (!this.active) {
            return false;
        }
        if (state.isDown(UserAction.Right)) {
            if (!step) {
                this.walk.start(true);
            }

            this.direction = Direction.Right;
            this.running = true;
            return true;
        }
        if (state.isDown(UserAction.Left)) {
            if (!step) {
                this.walk.start(false);
            }
            this.direction = Direction.Left;
            this.running = true;
            return true;
        }
        if (state.isReleased(UserAction.Right)) {
            if (step) {
                this.stepAnimation.stepForward();
            } else {
                this.walk.stop();
            }
            this.running = false;
            return true;
        }
        if (state.isReleased(UserAction.Left)) {

            if (step) {
                this.stepAnimation.stepBackwards();
            } else {
                this.walk.stop();
            }
            this.running = false;
            return true;
        }

        if (state.isReleased(UserAction.Up)) {
            this.active = false;
            this.teleport.start(true).onDone(() => {
                this.active = true;
            })
        }
        if (state.isReleased(UserAction.Down)) {
            this.active = false;
            this.teleport.start(false).onDone(() => {
                this.active = true;
            })
        }
        return false;
    }

    run(dt: number): void {
        if (this.running) {
            if (this.direction == Direction.Right) {
                this.position.x += 5;
            } else {
                this.position.x -= 5;
            }
            this.teleport.groundLevel = this.position.y;
            this.teleport.xOffset = this.position.x;
            this.sprite.setSpritePosition(this.position.x, this.position.y);
        }
    }

    update(dt: number): void {
        this.sprite.update(dt);
        this.teleport.update(dt);
        this.walk.update(dt);
        this.run(dt);
    }

}
