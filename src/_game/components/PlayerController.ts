import { stat } from "fs";
import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { InputState } from "../../core/InputHandler";
import { UserAction } from "../../core/UserAction";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TextureAssest } from "../system/GameAssetManager";
import { TeleportAnimation } from "./TeleportAnimation";


export class PlayerController extends Component {

    private active: boolean;
    private sprite: SpritBatchController;
    teleport: TeleportAnimation;

    constructor(eng: Engine) {
        super(eng);
        this.sprite = new SpritBatchController(eng);
        this.teleport = new TeleportAnimation(this.eng);
    }

    initialize(): void {

        const spriteData = this.eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(spriteData.texture, spriteData.data);

        this.sprite.activeSprite('player');
        this.sprite.setSprite('teleport.1');
        this.sprite.scale(2.0)
        this.sprite.setSpritePosition(10, this.eng.height - this.sprite.spriteHeight() - 200);

        this.teleport.initialize(this.sprite);
        // setup the teleport animation
        let goingup = false;

        this.teleport.start(goingup).onDone(() => {
            this.active = true;
        })

    }

    handleUserAction(state: InputState): boolean {
        if (!this.active) {
            return false;
        }
        if (state.isDown(UserAction.Right)) {
            console.debug('down"')
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

    update(dt: number): void {
        this.sprite.update(dt);
        this.teleport.update(dt);
    }

}
