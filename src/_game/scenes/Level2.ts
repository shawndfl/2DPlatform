import { SceneComponent } from '../../components/SceneComponent';
import Level2Data from '../assets/level2/level2.json';
import { PlatformEngine } from '../PlatformEngine';

import { InputState } from '../../core/InputState';
import { LevelData2 } from '../data/ILevelData2';
import { ParticleTest } from '../samples/ParticleTest';
import { Collision2D } from '../../physics/Collision2D';
import { CollisionBox } from '../tiles/CollisionBox';
import { BackgroundComponent } from '../../components/BackgroundComponet';
import { Elevator } from '../tiles/Elevator';
import { CollisionFactory } from '../tiles/CollisionFactory';

export class Level2 extends SceneComponent {
  private particleTest: ParticleTest;
  private collisions: Collision2D[];
  private updatableCollisions: Collision2D[];
  private levelData: LevelData2;

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);

    this.particleTest = new ParticleTest(this.eng);
  }

  async initialize(): Promise<void> {
    this.particleTest.initialize();

    // save the level data
    const data = new LevelData2(Level2Data);
    this.levelData = data;
    console.debug(this.levelData);

    // set the view and the limits
    this.eng.viewManager.setXLimits(0, data.size.x);
    this.eng.viewManager.setYLimits(0, data.size.y);
    this.eng.physicsManager.initializeBounds(data.size.x, data.size.y);

    // load all the collision
    this.collisions = [];
    this.updatableCollisions = [];
    for (let i = 0; i < data.collision.length; i++) {
      const options = data.collision[i];

      // create different collision types
      const collision = CollisionFactory.create(this.eng, options);
      // save the collision
      this.collisions.push(collision);
      // check if it requires an update
      if (collision.requireUpdate) {
        this.updatableCollisions.push(collision);
      }
    }

    // show the background image
    const promises = [];
    for (let i = 0; i < data.backgrounds.length; i++) {
      const bgData = data.backgrounds[i];

      // create the background
      const bg = new BackgroundComponent(
        this.eng,
        bgData.id ?? this.eng.random.getUuid()
      );

      // load the image
      promises.push(bg.initialize(bgData.image, data.size));

      this.eng.backgroundManager.addBackground(bg);
    }

    // wait for all images to load
    await Promise.all(promises);
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
    this.updatableCollisions.forEach((c) => c.update(dt));
  }

  postUpdate(dt: number): void {}

  dispose(): void {
    this.eng.backgroundManager.dispose();
  }
}
