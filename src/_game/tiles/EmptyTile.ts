import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { GroundManager } from "../system/GroundManager";
import { TileComponent } from "./TileComponent";


export const EmptyTileId = '---';

/**
 * An empty tile is one that doesn't render anything
 */
export class EmptyTile extends TileComponent {
    get spriteController(): SpritBaseController {
        return null;
    }

    get id(): string {
        return EmptyTileId;
    }

    constructor(gm: GroundManager, i?: number, j?: number, k?: number) {
        super(gm, { tileClass: EmptyTileId, spriteName: null, i, j, k, options: [] });

        if (i && j && k) {
            this.setTilePosition(i, j, k);
        }
    }
}
