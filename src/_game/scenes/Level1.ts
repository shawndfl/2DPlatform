import { SceneComponent } from "../../components/SceneComponent";

import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TextureAssest } from "../system/GameAssetManager";


export class Level1 extends SceneComponent {

  private sprite: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);
    this.sprite = new SpritBatchController(eng);
    const spriteData = eng.assetManager.getTexture(TextureAssest.player1);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    this.sprite.activeSprite('player');
    this.sprite.setSprite('all');
    this.sprite.scale(2.0)
    this.sprite.setSpritePosition(10, this.eng.height - this.sprite.spriteHeight());
    //this.mesh = new Mesh(eng);

  }

  initialize() {

  }

  async ShowScene(): Promise<void> {

    console.debug('initialize mesh');
  }

  update(dt: number): void {
    this.sprite.update(dt);
  }
}