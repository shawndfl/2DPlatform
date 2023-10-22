import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { TeleportAnimation } from "../components/TeleportAnimation";
import { TextureAssest } from "../system/GameAssetManager";

export class Level1 extends SceneComponent {

  private sprite: SpritBatchController;
  private teleport: TeleportAnimation;

  constructor(eng: Engine) {
    super(eng);
    this.sprite = new SpritBatchController(eng);
    const spriteData = eng.assetManager.getTexture(TextureAssest.player1);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    this.sprite.activeSprite('player');
    this.sprite.setSprite('teleport.1');
    this.sprite.scale(2.0)
    this.sprite.setSpritePosition(10, this.eng.height - this.sprite.spriteHeight() - 200);

    this.teleport = new TeleportAnimation(eng);
    this.initialize();
  }

  initialize() {
    this.teleport.initialize(this.sprite);
    // setup the teleport animation
    let goingup = false;

    this.teleport.start(goingup).onDone(() => {
      goingup = !goingup;
      this.teleport.start(goingup)
    })
  }

  async ShowScene(): Promise<void> {

    console.debug('initialize mesh');
  }

  update(dt: number): void {
    this.sprite.update(dt);
    this.teleport.update(dt);
  }
}