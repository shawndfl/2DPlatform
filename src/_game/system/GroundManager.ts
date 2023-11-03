import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import rect from "../../math/rect";
import vec2 from "../../math/vec2";
import { PlatformEngine } from "../PlatformEngine";
import { GameComponent } from "../components/GameComponent";
import { Direction } from "../components/PlayerController";
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

    /**
     * Get all tiles inside this bounds
     * @param bounds 
     * @returns 
     */
    getTilesAt(screenBounds: Readonly<rect>): TileComponent[] {
        const iStart = Math.floor(screenBounds.left / TileComponent.tileWidth);
        const iEnd = Math.floor(screenBounds.right / TileComponent.tileWidth);
        const jStart = Math.floor(screenBounds.bottom / TileComponent.tileHeight);
        const jEnd = Math.floor(screenBounds.top / TileComponent.tileHeight);
        const k = 0;
        const tiles = [];
        for (let j = jStart; j <= jEnd; j++) {
            for (let i = iStart; i <= iEnd; i++) {
                const tile = this.getTileAt(i, j, k);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
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

    /**
     * Gets the closest tiles
     * @param bounds - in tile space
     * @param direction - direction to look in
     * @param x 
     */
    getClosestTiles(screenBounds: Readonly<rect>, direction: Direction): TileComponent[] {

        const iStart = Math.floor(screenBounds.left / TileComponent.tileWidth);
        const iEnd = Math.floor(screenBounds.right / TileComponent.tileWidth);
        const jStart = Math.floor(screenBounds.bottom / TileComponent.tileHeight);
        const jEnd = Math.floor(screenBounds.top / TileComponent.tileHeight);
        const k = 0;
        const tiles = [];
        switch (direction) {
            case Direction.Up:
                for (let j = jEnd; j < this.tiles[k].length; j++) {
                    for (let i = iStart; i < iEnd; i++) {
                        const tile = this.getTileAt(i, j, k);
                        if (tile) {
                            tiles.push(tile);
                        }
                    }
                }
                tiles.sort((a, b) => a.screenPosition.y - b.screenPosition.y);
                break;
            case Direction.Down:
                for (let j = jStart; j >= 0; j--) {
                    for (let i = iStart; i < iEnd; i++) {
                        const tile = this.getTileAt(i, j, k);
                        if (tile) {
                            tiles.push(tile);
                        }
                    }
                }
                tiles.sort((a, b) => b.screenPosition.y - a.screenPosition.y);
                break;
            case Direction.Right:
                for (let j = jStart; j < jEnd; j++) {
                    for (let i = iEnd; i < this.tiles[k][j].length; i++) {
                        const tile = this.getTileAt(i, j, k);
                        if (tile) {
                            tiles.push(tile);
                        }
                    }
                }
                tiles.sort((a, b) => a.screenPosition.x - b.screenPosition.x);
                break;
            case Direction.Left:
                for (let j = jStart; j < jEnd; j++) {
                    for (let i = iStart; i >= 0; i--) {
                        const tile = this.getTileAt(i, j, k);
                        if (tile) {
                            tiles.push(tile);
                        }
                    }
                }
                tiles.sort((a, b) => b.screenPosition.x - a.screenPosition.x);
                break;
        }
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