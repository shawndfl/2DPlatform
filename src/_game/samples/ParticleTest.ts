import { Component } from '../../components/Component';
import { SpriteInstanceCollection } from '../../graphics/SpriteInstanceCollection';
import vec2 from '../../math/vec2';
import { Emitter } from '../../particle/Emitter';

export class ParticleTest extends Component {
  private emitter: Emitter;

  initialize() {
    this.emitter = new Emitter(this.eng);
    this.emitter.initialize({
      position: new vec2(550, 600),
    });
  }

  update(dt: number) {
    this.emitter.update(dt);
  }
}
