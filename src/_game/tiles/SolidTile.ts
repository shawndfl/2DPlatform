import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { Collision2D } from "../../physics/Collision2D";
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
        const collision = new Collision2D(this.eng, this.id, this.screenBounds)
        this.eng.physicsManager.addStatic(collision);
    }

    initialize(): void {

    }
}