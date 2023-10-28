import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import rect from "../../math/rect";
import vec2 from "../../math/vec2";
import { PlatformEngine } from "../PlatformEngine";
import { GameComponent } from "../components/GameComponent";
import { ILevelData } from "../data/ILevelData";
import { TileComponent } from "../tiles/TileComponent";
import { TileFactory } from "../tiles/TileFactorey";
import { TextureAssest } from "./GameAssetManager";

export class GroundManager extends GameComponent {

    private _staticSprite: SpritBatchController;
    private _tileFactory: TileFactory;
    protected _levelData: ILevelData;

    private tiles: TileComponent[][][];

    public get staticSprite() {
        return this._staticSprite;
    }

    public get tileFactory() {
        return this._tileFactory;
    }

    constructor(eng: PlatformEngine) {
        super(eng);
        this._staticSprite = new SpritBatchController(this.eng);
        this._tileFactory = new TileFactory(this);
        this.tiles = [[[]]]
    }

    loadLevel(level: ILevelData): void {
        this.dispose();
        this._levelData = level;

        for (let k = 0; k < level.encode.length; k++) {
            this.tiles.push([]);
            for (let j = 0; j < level.encode[k].length; j++) {
                this.tiles[k].push([]);
                const invertedJ = level.encode[k].length - 1 - j;
                const row = level.encode[k][invertedJ];
                for (let s = 0; s < row.length; s += 2) {
                    const i = s / 2;
                    const element = row[s] + row[s + 1];
                    const index = parseInt(element, 16);
                    const type = level.tiles[index];
                    const tile = this.tileFactory.create(type, i, j, k);
                    this.tiles[k][j].push(tile);
                }
            }
        }
    }

    /**
     * Initial the sprites
     */
    initialize(): void {
        const assets = this.eng.assetManager.getTexture(TextureAssest.level1);
        this._staticSprite.initialize(assets.texture, assets.data);
    }
    private tempBounds: rect;
    /**
     * Gets the tile below this x position in screen pixels
     * @param x 
     */
    getTileBelow(tile: TileComponent): TileComponent[] {

        const tileI1 = Math.floor(tile.tileBounds.left);
        const tileI2 = Math.floor(tile.tileBounds.right);
        let tileJ = tile.tileBounds.top;
        const k = 0;
        const tiles = [];
        for (let j = tileJ; j > 0; j--) {
            if (!this.tiles[k] || !this.tiles[k][j]) {
                continue
            }
            let tile = this.tiles[k][j][tileI1];
            if (tile && !tile.empty) {
                tiles.push(tile);
            }
            if (tileI1 != tileI2) {
                tile = this.tiles[k][j][tileI2];
                if (tile && !tile.empty) {
                    tiles.push(tile);
                }
            }
        }
        tiles.sort((a, b) => b.screenPosition.y - a.screenPosition.y);
        return tiles;
    }

    update(dt: number): void {
        this._staticSprite.update(dt);
    }

    dispose(): void {
        for (let k = 0; k < this.tiles.length; k++) {
            for (let j = 0; j < this.tiles.length; j++) {
                for (let i = 0; i < this.tiles[j].length; i++) {
                    this.tiles[k][j][i]?.dispose();
                }
            }
        }

        this.tiles = [[]];
    }

}