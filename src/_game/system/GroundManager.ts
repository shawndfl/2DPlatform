import { Component } from "../../components/Component";
import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { ILevelData } from "../data/ILevelData";
import { TileComponent } from "../tiles/TileComponent";
import { TileFactory } from "../tiles/TileFactorey";
import { TextureAssest } from "./GameAssetManager";

export class GroundManager extends Component {

    private _staticSprite: SpritBatchController;
    private _tileFactory: TileFactory;

    private tiles: TileComponent[][][];

    public get staticSprite() {
        return this._staticSprite;
    }

    public get tileFactory() {
        return this._tileFactory;
    }

    constructor(eng: Engine) {
        super(eng);
        this._staticSprite = new SpritBatchController(this.eng);
        this._tileFactory = new TileFactory(this);
        this.tiles = [[[]]]
    }

    initialize(level: ILevelData): void {
        this.dispose();
        const assets = this.eng.assetManager.getTexture(TextureAssest.level1);
        this._staticSprite.initialize(assets.texture, assets.data);

        for (let k = 0; k < level.encode.length; k++) {
            this.tiles.push([]);
            for (let j = 0; j < level.encode[k].length; j++) {
                this.tiles[k].push([]);

                const row = level.encode[k][j];
                for (let s = 0; s < row.length; s += 2) {
                    const i = s / 2;
                    const element = row[s] + row[s + 1];
                    const index = parseInt(element, 16);
                    const type = level.tiles[index];
                    const tile = this.tileFactory.create(type, i, j, k);
                    console.debug(i + ', ' + j, this.tiles);
                    this.tiles[k][j].push(tile);
                }
            }
        }
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