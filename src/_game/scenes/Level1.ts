import { SceneComponent } from "../../components/SceneComponent";

import { Engine } from "../../core/Engine";
import { SpritBatchController } from "../../graphics/SpriteBatchController";
import { Curve } from "../../math/Curve";
import { TextureAssest } from "../system/GameAssetManager";


export class Level1 extends SceneComponent {

  private sprite: SpritBatchController;
  private curve: Curve;

  constructor(eng: Engine) {
    super(eng);
    this.sprite = new SpritBatchController(eng);
    const spriteData = eng.assetManager.getTexture(TextureAssest.player1);

    this.sprite.initialize(spriteData.texture, spriteData.data);

    this.sprite.activeSprite('player');
    this.sprite.setSprite('teleport.1');
    this.sprite.scale(2.0)
    this.sprite.setSpritePosition(10, this.eng.height - this.sprite.spriteHeight() - 200);


    this.curve = new Curve();
    const points: { p: number, t: number }[] = []

    points.push({ p: 1, t: 0 });
    points.push({ p: 2, t: 100 });
    points.push({ p: 3, t: 250 });
    points.push({ p: 4, t: 300 });
    points.push({ p: 5, t: 350 });
    points.push({ p: 6, t: 400 });
    points.push({ p: 7, t: 450 });
    points.push({ p: 7, t: 2000 });

    this.curve.points(points);
    this.curve.repeat(-1);
    this.curve.pingPong(true);
    this.curve.start(true, (curve) => {

    }, (value) => {
      this.sprite.setSprite('teleport.' + value);
    })
  }

  initialize() {

  }

  async ShowScene(): Promise<void> {

    console.debug('initialize mesh');
  }

  update(dt: number): void {
    this.sprite.update(dt);
    this.curve.update(dt);
  }
}