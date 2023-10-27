import { Component } from "../../components/Component";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import vec3 from "../../math/vec3";
import { GroundManager } from "../system/GroundManager";

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
export abstract class TileComponent extends Component {

    protected _tileIndex: vec3 = new vec3();
    private _id: string;

    protected screenPosition: vec3 = new vec3();
    protected _tilePosition: vec3 = new vec3();

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

    public get options(): string[] {
        return this._tileData.options;
    }

    public get tileIndex(): vec3 {
        return this._tileIndex;
    }

    public abstract get spriteController(): SpritBaseController;

    constructor(private _groundManager: GroundManager, private _tileData: ITileCreationArgs) {
        super(_groundManager.eng);
        this._tileIndex = new vec3([this._tileData.i, this._tileData.j, this._tileData.k]);
        this._id = this.createTileId(this._tileData?.i, this._tileData?.j, this._tileData?.k);
    }

    createTileId(i: number, j: number, k: number): string {
        return 'tile.' + (i ?? '_') + '.' + (j ?? '_') + '.' + (k ?? '_');
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

        const indexI = Math.floor(this._tilePosition.x);
        const indexJ = Math.floor(this._tilePosition.y);
        const indexK = Math.floor(this._tilePosition.z);

        this._tileIndex.x = indexI;
        this._tileIndex.y = indexJ;
        this._tileIndex.z = indexK;

        this.screenPosition.x = this._tilePosition.x * 64;
        this.screenPosition.y = this.eng.height - 24 - this._tilePosition.y * 24;

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