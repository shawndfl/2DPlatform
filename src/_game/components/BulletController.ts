
import { SpriteFlip } from "../../graphics/Sprite";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve } from "../../math/Curve";
import vec3 from "../../math/vec3";
import { SpriteId } from "../data/SpriteId";
import { BulletOptions } from "../system/BulletManager";
import { GameComponent } from "./GameComponent";

export class BulletController extends GameComponent {

    private _active: boolean;
    private sprite: SpritBatchController;
    private _options: BulletOptions;
    private _pos: vec3;
    private _vel: vec3;

    public get active(): boolean {
        return this._active
    }

    public get position(): vec3 {
        return this._pos;
    }

    initialize(sprite: SpritBatchController, options: BulletOptions): void {
        this.sprite = sprite;
        this._options = options;
        this._pos = this._options.position.copy();
        this._vel = this._options.velocity.copy();
        this.sprite.activeSprite(options.id);
        this.sprite.setSprite('bullet.normal.1');
        this.sprite.setSpritePosition(options.position.x, options.position.y, options.position.z);
        this._active = true;
    }

    stop(): void {

    }

    private hitTest(newPos: vec3): boolean {
        if (newPos.x > this.eng.width + this.sprite.spriteWidth()) {
            return true;
        }
        if (newPos.x < 0 - this.sprite.spriteWidth()) {
            return true;
        }

        if (newPos.y > this.eng.height + this.sprite.spriteHeight()) {
            return true;
        }
        if (newPos.y < -this.sprite.spriteHeight()) {
            return true;
        }
    }

    update(dt: number): void {
        // make sure the correct sprite is active
        this.sprite.activeSprite(this._options.id);

        const newPos = this._pos.copy();
        newPos.add(this._options.velocity.copy(this._vel).scale(dt * .001));

        // do collision detection
        if (this.hitTest(newPos)) {
            this._active = false;
            this.sprite.removeSprite(this._options.id);
            this.sprite.commitToBuffer();
        } else {
            // update position
            newPos.copy(this._pos);
            this.sprite.setSpritePosition(this._pos.x, this._pos.y, this._pos.z);
            this.sprite.commitToBuffer();
        }
    }

}