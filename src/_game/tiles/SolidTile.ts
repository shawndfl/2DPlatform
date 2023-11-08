import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { GroundManager } from "../system/GroundManager";
import { TileComponent, ITileCreationArgs } from "./TileComponent";


export class SolidTile extends TileComponent {

    public get spriteController(): SpritBaseController {
        return this.gm.staticSprite.activeSprite(this.id);
    }

    constructor(gm: GroundManager, tileData: ITileCreationArgs) {
        super(gm, tileData);

        gm.staticSprite.activeSprite(this.id);
        gm.staticSprite.scale(2.0);
        gm.staticSprite.setSprite(this.spriteName);

        this.setTilePosition(tileData.i, tileData.j, tileData.k);

        gm.staticSprite.commitToBuffer();
    }

    initialize(): void {

    }
}