import { SpritBaseController } from "../../graphics/SpriteBaseController";
import vec3 from "../../math/vec3";
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
        const collision = new Collision2D(gm.eng, this.id, this, this.screenBounds)
        this.eng.physicsManager.setCollision(collision);
    }

    /**
    * Sets the sprite position given a screen position
    * @param position - If the position is not given this will just update the sprite position
    *                   with the current screen position. 
    */
    setScreenPosition(position?: Readonly<vec3>) {

        super.setScreenPosition(position);
    }

    initialize(): void {

    }
}