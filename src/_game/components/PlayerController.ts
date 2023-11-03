import { InputState } from "../../core/InputHandler";
import { UserAction } from "../../core/UserAction";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TextureAssest } from "../system/GameAssetManager";
import { TeleportAnimation } from "./TeleportAnimation";
import { WalkAnimation } from "./WalkAnimation";
import { PlatformEngine } from "../PlatformEngine";
import { TileComponent } from "../tiles/TileComponent";
import vec3 from "../../math/vec3";
import { SpriteId } from "../data/SpriteId";
import { BulletType } from "../system/BulletManager";
import { ShootAnimation } from "./ShootAnimation";
import rect from "../../math/rect";

export enum Direction {
    Right,
    Left,
    Up,
    Down
}

export class PlayerController extends TileComponent {

    private active: boolean;
    private sprite: SpritBatchController;
    private tempPosition: vec3;
    private tempBounds: rect;
    private running: boolean;
    private direction: Direction;
    private teleport: TeleportAnimation;
    private walk: WalkAnimation;
    private shootAnimation: ShootAnimation;

    get id(): string {
        return SpriteId.Player;
    }

    get lookingRight(): boolean {
        return this.direction == Direction.Right;
    }

    get lookingLeft(): boolean {
        return this.direction == Direction.Left;
    }

    public get spriteController(): SpritBaseController {
        return this.sprite;
    }

    constructor(eng: PlatformEngine) {
        super(eng.groundManager, { i: 0, j: 0, k: 0, options: [], spriteName: 'default', tileClass: 'PlayerController' });
        this.sprite = new SpritBatchController(eng);
        this.teleport = new TeleportAnimation(this.eng);
        this.walk = new WalkAnimation(this.eng);
        this.shootAnimation = new ShootAnimation(this.eng);

        this.direction = Direction.Right;
        this.running = false;
    }

    initialize(): void {

        const spriteData = this.eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(spriteData.texture, spriteData.data);
        this.setTilePosition(2, 9, 0);

        this.sprite.activeSprite(this.id);
        this.sprite.setSprite('teleport.1');
        this.sprite.scale(2.0);
        this.setPosition(this.screenPosition);

        this.teleport.initialize(this.sprite);
        this.walk.initialize(this.sprite);
        this.shootAnimation.initialize(this.sprite);

        // setup the teleport animation
        let goingUp = false;

        this.teleport.start(goingUp).onDone(() => {
            this.active = true;
        });

        this.tempPosition = this.screenPosition.copy();
    }

    handleUserAction(state: InputState): boolean {

        if (!this.active) {
            return false;
        }
        if (state.isDown(UserAction.Right)) {
            this.walk.start(true);

            this.direction = Direction.Right;
            this.running = true;
            return true;
        }
        if (state.isDown(UserAction.Left)) {

            this.walk.start(false);
            this.direction = Direction.Left;
            this.running = true;
            return true;
        }
        if (state.isReleased(UserAction.Right)) {
            this.walk.stop();
            this.running = false;
            return true;
        }
        if (state.isReleased(UserAction.Left)) {
            this.walk.stop();
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
        if (state.isReleased(UserAction.Y)) {
            this.shoot();
        }
        if (state.isDown(UserAction.B)) {
            console.debug('jumping...');

        }
        if (state.isReleased(UserAction.B)) {
            console.debug('reset jump');

        }
        if (state.isDown(UserAction.TriggerR)) {
            console.debug('dashing...');
        }
        if (state.isReleased(UserAction.TriggerR)) {
            console.debug('reset dash');

        }
        return false;
    }

    private shoot(): void {
        console.debug('shooting');
        const facingRight = this.direction == Direction.Right;
        this.shootAnimation.start(facingRight);
        const startPos = this._screenPosition.copy();
        startPos.y += 30;
        startPos.x += facingRight ? 50 : -5;
        const speed = 500;
        const velocity = new vec3(facingRight ? speed : -speed, 0, 0);
        this.eng.bullets.addBullet({ bulletType: BulletType.Normal, position: startPos, velocity });
    }

    run(dt: number): void {
        if (this.running) {
            this.screenPosition.copy(this.tempPosition);

            if (this.direction == Direction.Right) {
                this.tempPosition.x += 5;
            } else {
                this.tempPosition.x -= 5;
            }
            const stop = this.checkForCollision(this.tempPosition);
            if (!stop) {
                this.setPosition(this.tempPosition);
            }
        }
    }

    /**
     * Are the bounds facing away from a given tile
     * @param mybounds 
     * @param tile 
     * @returns 
     */
    facingAwayFromTile(mybounds: Readonly<rect>, tile: TileComponent): boolean {
        if (this.direction == Direction.Right) {
            if (mybounds.right < tile.screenBounds.right) {
                return false;
            }
        }

        if (this.direction == Direction.Left) {
            if (mybounds.left > tile.screenBounds.left) {
                return false;
            }
        }

        return true;

    }

    checkForCollision(screenPosition: vec3): boolean {

        this.tempBounds = this.screenBounds.copy(this.tempBounds);
        this.tempBounds.left = this.screenPosition.x;
        this.tempBounds.top = this.screenPosition.y + this.tempBounds.height;

        // check screen bounds
        if (this.tempBounds.left < this.eng.viewManager.left && this.lookingLeft) {
            return true;
        }
        if (this.tempBounds.right > this.eng.viewManager.right && this.lookingRight) {
            return true;
        }
        if (this.tempBounds.top > this.eng.viewManager.top) {
            return true;
        }
        if (this.tempBounds.top < this.eng.viewManager.bottom) {
            return true;
        }

        // check to tiles
        let tiles = this.eng.groundManager.getTilesAt(this.tempBounds);
        tiles = tiles.filter((tile) => !this.facingAwayFromTile(this.tempBounds, tile))

        return tiles.length > 0;
    }

    fall(): void {

    }

    private lastTilesBelow: TileComponent[] = [];

    setPosition(position: vec3): void {
        const tilePosition = this.screenToTile(position);
        super.setTilePosition(tilePosition.x, tilePosition.y, tilePosition.z);

        // clear the old tiles
        this.lastTilesBelow.forEach((tile) => tile.spriteController.setSprite(tile.spriteName))

        this.lastTilesBelow = this.eng.groundManager.getClosestTiles(this.tileBounds, Direction.Down);

        // highlight the ones below
        this.lastTilesBelow.forEach(tile => tile.spriteController.setSprite('block.1.glow'));

        this.teleport.groundLevel = position.y;
        this.teleport.xOffset = position.x;
        const forwardPadding = 200;
        const upPadding = 100;
        const xOffset = this.screenPosition.x - this.eng.width / 2 + forwardPadding;
        const yOffset = this.screenPosition.y - this.eng.height / 2 + upPadding;
        this.eng.viewManager.setTarget(xOffset, yOffset);

        console.debug('player pos: ' + this.screenPosition);
    }

    update(dt: number): void {
        this.sprite.update(dt);
        this.teleport.update(dt);
        this.walk.update(dt);
        this.shootAnimation.update(dt);
        this.run(dt);
    }

}
