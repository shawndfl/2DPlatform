import { Component } from '../../components/Component';
import { SpriteController2 } from '../../graphics/SpriteController2';
import rect from '../../math/rect';
import vec4 from '../../math/vec4';

export class SpriteTest extends Component {
  private sprite: SpriteController2;

  initialize() {
    this.sprite = new SpriteController2(this.eng);

    const sprite = this.eng.assetManager.getTexture('enemies');
    this.sprite.initialize(sprite.texture, sprite.data);
    this.sprite.spriteImage('default');
    this.sprite.left = 1200;
    this.sprite.top = 600;
    this.sprite.angle = 0;
    this.sprite.colorScale = new vec4([0, 1, 0, 1]);
    this.sprite.alpha = 0.5;
    this.sprite.topOffset = 1;
    this.sprite.leftOffset = 1;
    this.sprite.depth = -0.8;
    this.sprite.xScale = 2.0;
    this.sprite.yScale = 2;

    this.eng.annotationManager.buildRect(
      'spriteTest',
      new rect([
        this.sprite.left,
        this.sprite.width,
        this.sprite.top + this.sprite.height,
        this.sprite.height,
      ]),
      new vec4([0.5, 0.9, 0.1, 1])
    );
  }

  update(dt: number) {
    this.sprite.update(dt);
  }
}
