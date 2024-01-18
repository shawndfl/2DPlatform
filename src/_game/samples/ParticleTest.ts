import { Component } from '../../components/Component';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';
import vec4 from '../../math/vec4';
import { Emitter } from '../../particle/Emitter';

export class ParticleTest extends Component {
  private water: Emitter;
  private explode: Emitter;

  initialize() {
    this.water = new Emitter(this.eng, 'water.1');
    this.water.initialize({
      textureAsset: this.eng.assetManager.getTexture('enemies'),
      sprite: 'particle.1',
      waitForAll: false,
      position: new vec2(250, 700),
      maxParticles: 150,
      creationDelay: 10,
      positionMin: new vec2(0, 0),
      positionMax: new vec2(0, 0),
      angleMin: 90,
      angleMax: 45,
      speedMin: 0.5,
      speedMax: 0.8,
      scaleMin: 0.3,
      scaleMax: 0.4,
      rotation: 0,
      angularVelocity: 0,
      scaleAspectRatio: 1,
      scaleGrowth: 3 /** grow by 200% over the life time */,
      colorStart: new vec4(0, 0.5, 0.7, 1),
      colorEnd: new vec4(1.0, 1.0, 1.0, 0.3),
      gravity: new vec3(0, -7.9, 0),
      lifeTimeMin: 800,
      lifeTimeMax: 900,
      loc: [0, 0, 0, 0],
    });

    this.explode = new Emitter(this.eng, 'explode.1');
    this.explode.initialize({
      textureAsset: this.eng.assetManager.getTexture('enemies'),
      sprite: 'particle.1',
      waitForAll: true,
      position: new vec2(650, 700),
      maxParticles: 200,
      creationDelay: 0,
      positionMin: new vec2(0, 0),
      positionMax: new vec2(0, 0),
      scaleMin: 0.2,
      scaleMax: 0.2,
      angleMin: 0,
      angleMax: 360,
      speedMin: 2,
      speedMax: 2,
      rotation: 0,
      angularVelocity: 0,
      scaleAspectRatio: 1,
      scaleGrowth: 5 /** grow by 200% over the life time */,
      colorStart: new vec4(1, 1, 1, 1),
      colorEnd: new vec4(0.0, 0.0, 1.0, 0.3),
      gravity: new vec3(0, 0, 0),
      lifeTimeMin: 1000,
      lifeTimeMax: 1000,
      loc: [0, 0, 0, 0],
    });
  }

  update(dt: number) {
    this.water.update(dt);
    this.explode.update(dt);
  }
}
