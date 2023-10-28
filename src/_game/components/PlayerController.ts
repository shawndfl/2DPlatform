import { InputState } from "../../core/InputHandler";
import { UserAction } from "../../core/UserAction";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TextureAssest } from "../system/GameAssetManager";
import { TeleportAnimation } from "./TeleportAnimation";
import { WalkAnimation } from "./WalkAnimation";
import { StepAnimation } from "./StepAnimation";
import { PlatformEngine } from "../PlatformEngine";
import { TileComponent } from "../tiles/TileComponent";
import vec3 from "../../math/vec3";

export enum Direction {
    Right,
    Left
}

export class PlayerController extends TileComponent {

    private active: boolean;
    private sprite: SpritBatchController;
    private stepAnimation: StepAnimation;
    private tempPosition: vec3;
    private running: boolean;
    private direction: Direction;
    teleport: TeleportAnimation;
    walk: WalkAnimation;

    public get spriteController(): SpritBaseController {
        return this.sprite;
    }

    constructor(eng: PlatformEngine) {
        super(eng.groundManager, { i: 0, j: 0, k: 0, options: [], spriteName: 'default', tileClass: 'PlayerController' });
        this.sprite = new SpritBatchController(eng);
        this.teleport = new TeleportAnimation(this.eng);
        this.walk = new WalkAnimation(this.eng);

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
        ]);
    }

    initialize(): void {

        const spriteData = this.eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(spriteData.texture, spriteData.data);
        this.setTilePosition(2, 9, 0);

        this.sprite.activeSprite('player');
        this.sprite.setSprite('teleport.1');
        this.sprite.scale(2.0);
        this.setPosition(this.screenPosition);

        this.teleport.initialize(this.sprite);
        this.walk.initialize(this.sprite);
        // setup the teleport animation
        let goingUp = false;

        this.teleport.start(goingUp).onDone(() => {
            this.active = true;
        });

        this.tempPosition = this.screenPosition.copy();
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
            this.screenPosition.copy(this.tempPosition);

            if (this.direction == Direction.Right) {
                this.tempPosition.x += 5;
            } else {
                this.tempPosition.x -= 5;
            }

            //TODO collision and adjustments

            this.setPosition(this.tempPosition);
        }
    }

    fall(): void {

    }

    private lastTilesBelow: TileComponent[] = [];

    setPosition(position: vec3): void {
        const tilePosition = this.screenToTile(position);
        super.setTilePosition(tilePosition.x, tilePosition.y, tilePosition.z);

        // clear the old tiles
        this.lastTilesBelow.forEach((tile) => tile.spriteController.setSprite(tile.spriteName))

        this.lastTilesBelow = this.eng.groundManager.getTileBelow(this);

        // highlight the ones below
        this.lastTilesBelow.forEach(tile => tile.spriteController.setSprite('block.1.glow'));

        this.teleport.groundLevel = position.y;
        this.teleport.xOffset = position.x;
    }

    update(dt: number): void {
        this.sprite.update(dt);
        this.teleport.update(dt);
        this.walk.update(dt);
        this.run(dt);
    }

}
