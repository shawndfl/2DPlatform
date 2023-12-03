import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { Line } from "../../data/Line";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { SpriteInstanceController } from "../../graphics/SpriteInstanceController";
import rect from "../../math/rect";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import vec4 from "../../math/vec4";
import { BuiltInTextureAssets } from "../../systems/AssetManager";
import { PlatformEngine } from "../PlatformEngine";
import { GameComponent } from "../components/GameComponent";
import { ILevelData } from "../data/ILevelData";
import { TileComponent } from "../tiles/TileComponent";
import { TileFactory } from "../tiles/TileFactorey";
import { TextureAssets } from "./GameAssetManager";


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
        this.tiles = [[[]]];
    }

    buildLines(): void {

    }

    loadLevel(level: ILevelData): void {
        this.dispose();
        this._levelData = level;

        this.buildLines();


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
        const assets = this.eng.assetManager.getTexture(TextureAssets.level1);
        this._staticSprite.initialize(assets.texture, assets.data);
    }

    /**
     * Get a tile at this location
     * @param i - in tile space
     * @param j - in tile space
     * @param k - in tile space
     * @returns 
     */
    getTileAt(i: number, j: number, k: number): TileComponent {
        if (!this.tiles[k] || !this.tiles[k][j] || !this.tiles[k][j][i]) {
            return null;
        }
        let tile = this.tiles[k][j][i];
        if (!tile.empty) {
            return tile;
        }
        return null;
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