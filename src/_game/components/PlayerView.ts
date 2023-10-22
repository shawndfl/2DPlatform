import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TextureAssest } from "../system/GameAssetManager";

export class PlayerView extends Component {
    private sprite: SpritBatchController;

    constructor(eng: Engine) {
        super(eng);
        this.sprite = new SpritBatchController(eng);
        const spriteData = eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(spriteData.texture, spriteData.data);

        this.sprite.activeSprite('player');
        this.sprite.setSprite('teleport.1');
        this.sprite.scale(2.0)
        this.sprite.setSpritePosition(10, this.eng.height - this.sprite.spriteHeight() - 200);
    }

    initialize() {

    }
}