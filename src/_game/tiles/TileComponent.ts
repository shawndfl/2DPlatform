
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import rect from "../../math/rect";
import vec3 from "../../math/vec3";
import { GameComponent } from "../components/GameComponent";
import { PlayerController } from "../components/PlayerController";
import { GroundManager } from "../system/GroundManager";
import { EmptyTileId } from "./EmptyTileId";

export interface ITileCreationArgs {
    i: number,
    j: number,
    k: number,
    spriteName: string,
    tileClass: string,
    options: string[];
}

/**
 * A tile component
 */
export abstract class TileComponent extends GameComponent {

    static readonly tileWidth: number = 128;
    static readonly tileHeight: number = 48;

    private _id: string;
    protected _screenBounds: rect;
    protected _screenPosition: vec3 = new vec3();

    public get id(): string {
        return this._id;
    }

    public get gm(): GroundManager {
        return this._groundManager;
    }

    public get spriteName(): string {
        return this._tileData.spriteName;
    }

    public get classType(): string {
        return this._tileData.tileClass;
    }

    /**
     * Get the screen position.
     * If the components are changed make sure
     * to call setScreenPosition(). 
     */
    public get screenPosition(): vec3 {
        return this._screenPosition;
    }

    public get empty(): boolean {
        return this.id === EmptyTileId;
    }

    public get screenBounds(): Readonly<rect> {
        this._screenBounds.left = this._screenPosition.x;
        this._screenBounds.width = this.spriteController.spriteWidth();
        this._screenBounds.height = this.spriteController.spriteHeight();
        this._screenBounds.top = this._screenPosition.y + this.spriteController.spriteHeight();
        return this._screenBounds;
    }

    /**
     * Floating point value of the tile location
     */
    public get tilePosition(): Readonly<vec3> {
        return this.tilePosition;
    }

    public get options(): string[] {
        return this._tileData.options;
    }

    public abstract get spriteController(): SpritBaseController;

    constructor(private _groundManager: GroundManager, private _tileData: ITileCreationArgs) {
        super(_groundManager.eng);
        this._id = this.createTileId(this._tileData?.i, this._tileData?.j, this._tileData?.k);
        this._screenBounds = new rect([0, 0, 0, 0]);
    }

    /**
     * Default tile id from the index
     * @param i 
     * @param j 
     * @param k 
     * @returns 
     */
    createTileId(i: number, j: number, k: number): string {
        return 'tile.' + (i ?? '_') + '.' + (j ?? '_') + '.' + (k ?? '_');
    }

    /**
     * Get the screen position
     * @param index 
     * @param screen 
     * @returns 
     */
    TileToScreen(i: number, j: number, k: number, screen?: vec3): vec3 {
        if (!screen) {
            screen = new vec3();
        }
        screen.x = i * TileComponent.tileWidth;
        screen.y = j * TileComponent.tileHeight;
        return screen;
    }

    /**
     * Check for a collision with another tile
     * @param other 
     * @returns 
     */
    isColliding(other: TileComponent): boolean {
        return this.screenBounds.intersects(other.screenBounds);
    }

    /**
     * Handle collision when a tile is colliding with us.
     * @param other - The other tile
     * @param newPosition - the other tile's new position. This can be adjusted.
     */
    onCollision(other: TileComponent): void {
        if (other instanceof PlayerController) {
            const player = other as PlayerController;
            if (this.isColliding(other)) {
                let left = Math.min(this.screenBounds.left - player.screenBounds.right, 0);
                let right = Math.min(player.screenBounds.left - this.screenBounds.right, 0);
                let top = Math.min(player.screenBounds.bottom - this.screenBounds.top, 0);
                let bottom = Math.min(this.screenBounds.bottom - player.screenBounds.top);

                if (left > right && left > top && left > bottom) {
                    other.screenPosition.x += left;
                } else if (right > left && right > top && right > bottom) {
                    other.screenPosition.x -= right;
                } else if (top > right && top > left && top > bottom) {
                    other.screenPosition.y -= top;
                } else if (bottom > right && bottom > left && bottom > top) {
                    other.screenPosition.y += bottom;
                }
            }
        }
    }

    /**
     * Take the screen position and convert it to a tile index (int)
     * @param screen 
     * @param index 
     * @returns 
     */
    screenToTile(screen: vec3, index?: vec3): vec3 {
        if (!index) {
            index = new vec3();
        }

        index.x = screen.x / TileComponent.tileWidth;
        index.y = screen.y / TileComponent.tileHeight;
        return index;
    }

    /**
   * Set the position in tile space. This will recalculate the tile position
   * and set the sprite position.
   * @param i
   * @param j
   * @param k
   */
    setTilePosition(i: number, j: number, k: number) {

        this.TileToScreen(i, j, k, this.screenPosition);
        this.setScreenPosition(this.screenPosition);
    }

    /**
     * Sets the sprite position given a screen position
     * @param position - If the position is not given this will just update the sprite position
     *                   with the current screen position. 
     */
    setScreenPosition(position?: Readonly<vec3>) {

        if (position) {
            this._screenPosition.x = position.x;
            this._screenPosition.y = position.y;
            this._screenPosition.z = position.z;
        }

        // move the sprite if there is one. some tiles like empty
        // don't need sprite controllers
        if (this.spriteController) {
            this.spriteController.setSpritePosition(this.screenPosition.x, this.screenPosition.y, this.screenPosition.z);
        }
    }

    initialize(): void {

    }

    update(dt: number) {

    }

    dispose() {

    }
}