import { Texture } from "../../graphics/Texture";
import { AssetManager } from "../../systems/AssetManager";
import { PlatformEngine } from "../PlatformEngine";
import Player1 from '../assets/man.png'
import Player1Data from '../assets/man.json'
import Player2 from '../assets/zero.png'
import Player2Data from '../assets/zero.json'
import Player1b from '../assets/man2.png'
import { ISpriteData } from "../../graphics/ISpriteData";

export enum TextureAssest {
    player1 = 'Player1',
    player2 = 'Player2',
}

/**
 * Manages game asses for this platform game
 */
export class GameAssetManager extends AssetManager {
    protected _player1: Texture;
    protected _player2: Texture;
    private textures: Map<string, { texture: Texture, data: ISpriteData }>;

    constructor(eng: PlatformEngine) {
        super(eng);
        this.textures = new Map<string, { texture: Texture, data: ISpriteData }>
    }

    getTexture(id: string): { texture: Texture; data: ISpriteData } {
        return this.textures.get(id);
    }

    async initialize() {
        super.initialize();
        this._player1 = new Texture(this.gl);
        await this._player1.loadImage(Player1);
        this.textures.set(TextureAssest.player1, {
            texture: this._player1, data: Player1Data
        });

        this._player2 = new Texture(this.gl);
        await this._player2.loadImage(Player2);
        this.textures.set(TextureAssest.player2, {
            texture: this._player2, data: Player2Data
        });

    }
}