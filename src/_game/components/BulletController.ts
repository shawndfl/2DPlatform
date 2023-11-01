
import { SpriteFlip } from "../../graphics/Sprite";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve } from "../../math/Curve";
import { SpriteId } from "../data/SpriteId";
import { BulletOptions } from "../system/BulletManager";
import { GameComponent } from "./GameComponent";

export class BulletController extends GameComponent {

    private active: boolean;
    private sprite: SpritBatchController;
    private options: BulletOptions;

    initialize(sprite: SpritBatchController, options: BulletOptions): void {
        this.sprite = sprite;
        this.options = options;
        this.sprite.activeSprite(options.id);
        this.sprite.setSprite('bullet.normal.1');
        this.sprite.setSpritePosition(options.position.x, options.position.y, options.position.z);
    }

    stop(): void {

    }

    start(facingRight: boolean): void {

    }

    update(dt: number): void {

    }

}