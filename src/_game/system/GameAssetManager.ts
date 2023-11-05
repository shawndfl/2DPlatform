import { Texture } from "../../graphics/Texture";
import { AssetManager } from "../../systems/AssetManager";
import { PlatformEngine } from "../PlatformEngine";
import Player1 from '../assets/man2.png'
import Player1Data from '../assets/man2.json'
import Player2 from '../assets/zero.png'
import Player2Data from '../assets/zero.json'
import Player1b from '../assets/man2.png'
import { ISpriteData } from "../../graphics/ISpriteData";

import level1Tile from '../assets/Level1Tiles.png'
import level1TileData from '../assets/Level1Tiles.json'

export enum TextureAssets {
    player1 = 'Player1',
    player2 = 'Player2',
    level1 = 'level1',
}

/**
 * Manages game asses for this platform game
 */
export class GameAssetManager extends AssetManager {
    private textures: Map<string, { texture: Texture, data: ISpriteData }>;

    constructor(eng: PlatformEngine) {
        super(eng);
        this.textures = new Map<string, { texture: Texture, data: ISpriteData }>
    }

    getTexture(name: TextureAssets): { texture: Texture; data: ISpriteData } {
        return this.textures.get(name);
    }

    async initialize() {
        super.initialize();

        this.textures.set(TextureAssets.player1, {
            texture: await (new Texture(this.gl)).loadImage(Player1), data: Player1Data
        });

        this.textures.set(TextureAssets.player2, {
            texture: await (new Texture(this.gl)).loadImage(Player2), data: Player2Data
        });

        this.textures.set(TextureAssets.level1, {
            texture: await (new Texture(this.gl)).loadImage(level1Tile), data: level1TileData
        });

    }
}