import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from '../geometry/GlBuffer';

import { Sprite } from '../graphics/Sprite';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export class LineComponent extends Component {

    private sprite: SpritBatchController;
    constructor(eng: Engine) {
        super(eng);
        this.sprite = new SpritBatchController(eng);
    }

    /**
     * Setup the line
     */
    initialize() {
        const texture = this.eng.assetManager.menu.texture;
        const data = this.eng.assetManager.menu.data;
        this.sprite.initialize(texture, data);
        this.sprite.setSprite('block');
        this.sprite.setSpritePosition(1, this.eng.height - 100);
        this.sprite.scale({ x: this.eng.width - 2, y: 2 });
        this.sprite.rotate(1);
        this.sprite.commitToBuffer();
    }

    /**
     * Draw the sprite
     * @param dt
     */
    update(dt: number) {
        this.sprite.update(dt);
    }


    dispose(): void {
    }
}
