
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

    private _id: string;
    protected _screenBounds: rect;
    protected _tileBounds: rect;
    protected _screenPosition: vec3 = new vec3();
    protected _tilePosition: vec3 = new vec3();

    public get id(): string {
        return this._id;
    }

    public get gm(): GroundManager {
        return this._groundManager;
    }

    static readonly tileWidth: number = 64;
    static readonly tileHeight: number = 24;

    public get spriteName(): string {
        return this._tileData.spriteName;
    }

    public get classType(): string {
        return this._tileData.tileClass;
    }

    public get screenPosition(): Readonly<vec3> {
        return this._screenPosition;
    }

    public get empty(): boolean {
        return this.id === EmptyTileId;
    }

    public get screenBounds(): Readonly<rect> {
        this._screenBounds.left = this._screenPosition.x;
        this._screenBounds.width = this.spriteController.spriteWidth();
        this._screenBounds.height = this.spriteController.spriteHeight();
        this._screenBounds.top = this._screenPosition.y;
        return this._screenBounds;
    }

    public get tileBounds(): Readonly<rect> {
        this._tileBounds.left = this._tilePosition.x;
        this._tileBounds.top = this._tilePosition.y;
        return this._tileBounds;
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
        this._tilePosition = new vec3([this._tileData.i, this._tileData.j, this._tileData.k]);
        this._id = this.createTileId(this._tileData?.i, this._tileData?.j, this._tileData?.k);
        this._screenBounds = new rect([0, 0, 0, 0]);
        this._tileBounds = new rect([0, 1, 0, 1]);
    }

    createTileId(i: number, j: number, k: number): string {
        return 'tile.' + (i ?? '_') + '.' + (j ?? '_') + '.' + (k ?? '_');
    }

    /**
     * Get the screen position
     * @param index 
     * @param screen 
     * @returns 
     */
    TileToScreen(index: vec3, screen?: vec3): vec3 {
        if (!screen) {
            screen = new vec3();
        }
        screen.x = index.x * TileComponent.tileWidth;
        screen.y = index.y * TileComponent.tileHeight;
        return screen;
    }

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
            player.screenPosition
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

        this._tilePosition.x = i;
        this._tilePosition.y = j;
        this._tilePosition.z = k;

        this.TileToScreen(this._tilePosition, this.screenPosition);

        // move the sprite if there is one. some tiles like empty
        // don't need sprite controllers
        if (this.spriteController) {
            this.spriteController.setSpritePosition(this.screenPosition.x, this.screenPosition.y, this.screenPosition.z);
        }
    }

    /**
     * Sets the sprite position given a screen position
     * @param position 
     */
    setScreenPosition(position: Readonly<vec3>) {

        this._screenPosition.x = position.x;
        this._screenPosition.y = position.y;
        this._screenPosition.z = position.z;

        this.screenToTile(this._screenPosition, this._tilePosition);

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