import { Component } from "../components/Component";
import { Engine } from "../core/Engine";
import { TileData } from "../graphics/ISpriteData";
import { SpriteInstanceController } from "../graphics/SpriteInstanceController";
import { toDegrees, toRadian } from "../math/constants";
import vec2 from "../math/vec2";
import vec4 from "../math/vec4";
import { BuiltInTextureAssets } from "./AssetManager";


export interface LineArgs {
    id: string,
    start: vec2,
    end: vec2,
    color: vec4,
    /** in pixels */
    thickness?: number;
    endArrow?: boolean;
}

export class AnnotationManager extends Component {

    private _lineSprites: SpriteInstanceController;
    private _boundSprites: SpriteInstanceController;

    private tileData: TileData;

    constructor(eng: Engine) {
        super(eng);
        this._lineSprites = new SpriteInstanceController(eng);
        //this._boundSprites = new SpriteInstanceController(eng);
    }

    buildLine(args: LineArgs): void {
        const id = args.id + "_line";
        const rotation = toDegrees(Math.atan2(args.end.y - args.start.y, args.end.x - args.start.x));
        const distance = args.end.copy().subtract(args.start).length();
        this._lineSprites.buildQuad(id, {
            translation: args.start,
            offset: new vec2(1, 0),
            color: args.color ?? new vec4([0, 0, 0, 1]),
            scaleWidth: distance * .5, // because of the offset is half the distance from center
            scaleHeight: args.thickness ?? 1,
            rotation: rotation,
            tileData: this.tileData
        });
    }

    initialize() {
        this._lineSprites.initialize();

        // setup texture and tile data
        this._lineSprites.setTexture(this.eng.assetManager.menu.texture);
        this.tileData = this.eng.assetManager.getSpriteInfo(BuiltInTextureAssets.Menu, "block");

        //this._boundSprites.initialize();
    }

    update(dt: number) {
        //this._boundSprites.update(dt);
        this._lineSprites.update(dt);
    }
}