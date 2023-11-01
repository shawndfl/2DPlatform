import { SpritBatchController } from "../../graphics/SpriteBatchController";
import vec3 from "../../math/vec3";
import { Random } from "../../utilities/Random";
import { PlatformEngine } from "../PlatformEngine";
import { BulletController } from "../components/BulletController";
import { GameComponent } from "../components/GameComponent";
import { TextureAssest } from "./GameAssetManager";

export enum BulletType {
    Normal,
}

export class BulletOptions {
    id?: string;
    position: vec3;
    bulletType: BulletType;
}

export class BulletManager extends GameComponent {

    readonly MaxBullets: number = 50;
    private bullets: BulletController[] = [];
    private inactiveBullets: BulletController[] = [];
    private sprite: SpritBatchController;

    constructor(eng: PlatformEngine) {
        super(eng);
        this.sprite = new SpritBatchController(this.eng);
    }

    /**
     * Add a bullet
     * @param options 
     * @returns 
     */
    addBullet(options: BulletOptions): BulletController {
        const bullet = this.inactiveBullets.pop();
        options.id = this.eng.random.getUuid();

        if (bullet) {
            bullet.initialize(this.sprite, options);
            this.bullets.push(bullet);
        }
        return bullet;
    }

    initialize(): void {
        const texture = this.eng.assetManager.getTexture(TextureAssest.player1);

        this.sprite.initialize(texture.texture, texture.data);

        for (let i = 0; i < this.MaxBullets; i++) {
            this.inactiveBullets.push(new BulletController(this.eng));
        }
    }

    update(dt: number): void {
        this.sprite.update(dt);
    }

}