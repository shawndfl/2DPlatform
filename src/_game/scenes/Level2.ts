import { SceneComponent } from '../../components/SceneComponent';
import Level2Data from '../assets/levels/level2.json';
import { PlatformEngine } from '../PlatformEngine';

import { InputState } from '../../core/InputState';
import vec4 from '../../math/vec4';
import { LevelData2 } from '../data/ILevelData2';
import { ParticleTest } from '../samples/ParticleTest';
import { Collision2D } from '../../physics/Collision2D';
import { CollisionBox } from '../tiles/CollisionBox';

export class Level2 extends SceneComponent {
  private particleTest: ParticleTest;
  private collision: Collision2D[];

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    const maxScreenSize = 100000;
    const maxHeightSize = 50000;
    this.eng.viewManager.minX = 0;
    this.eng.viewManager.maxX = maxScreenSize;
    this.eng.viewManager.maxY = maxHeightSize;
    this.eng.physicsManager.initializeBounds(maxScreenSize, maxHeightSize);

    this.particleTest = new ParticleTest(this.eng);
  }

  initialize(): void {
    this.particleTest.initialize();

    const levelData = new LevelData2(Level2Data);
    console.debug(levelData);

    // load all the collision
    this.collision = [];
    for (let i = 0; i < levelData.collision.length; i++) {
      const options = levelData.collision[i];

      // create different collision types
      if (options.type == 'box') {
        this.collision.push(new CollisionBox(this.eng, options));
      }
    }
  }

  /**
   * Handle user input
   * @param action
   * @returns
   */
  handleUserAction(action: InputState): boolean {
    return false;
  }

  update(dt: number): void {
    //this.particleTest.update(dt);
  }

  postUpdate(dt: number): void {}
}
