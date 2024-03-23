import { SceneComponent } from '../../components/SceneComponent';
import { PlatformEngine } from '../PlatformEngine';

import { InputState } from '../../core/InputState';
import { LevelData } from '../data/ILevelData';
import { ParticleTest } from '../samples/ParticleTest';
import { Collision2D } from '../../physics/Collision2D';

import { CollisionFactory } from '../tiles/CollisionFactory';
import { InputHud } from '../hud/inputHud';
import { UserAction } from '../../core/UserAction';
import { EntityFactory } from '../tiles/EntityFactory';
import { TileImageComponent } from '../../components/TileImageComponet';
import { Texture } from '../../graphics/Texture';
import { SpriteData } from '../../graphics/ISpriteData';

export class Level2 extends SceneComponent {
  private particleTest: ParticleTest;
  private collisions: Collision2D[];
  private updatableCollisions: Collision2D[];
  private levelData: LevelData;
  private inputHud: InputHud;
  private tileTexture: Texture;

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  get sceneData(): LevelData {
    return this.levelData;
  }

  /**
   *
   * @param eng
   * @param _type - Format is level##
   */
  constructor(eng: PlatformEngine, protected _type: string) {
    super(eng);

    this.particleTest = new ParticleTest(this.eng);
    this.inputHud = new InputHud(eng);
    this.tileTexture = new Texture('levelTile', this.eng.gl);
  }

  async initialize(): Promise<void> {
    this.particleTest.initialize();
    this.inputHud.initialize();

    // load the level data
    const data = await this.getLevelData();
    this.levelData = data;

    // set the view and the limits
    this.eng.viewManager.setXLimits(0, data.size.x);
    this.eng.viewManager.setYLimits(0, data.size.y);
    this.eng.physicsManager.initializeBounds(data.size.x, data.size.y);

    // setup the player for this level
    this.eng.player.loadPlayer(this.levelData.player);

    // create the bullets
    await this.eng.bullets.initialize();

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

    // load the tile texture
    await this.eng.tileManager.loadTexture(this.levelData.tileSheetUrl);

    // create the tile images
    for (let i = 0; i < data.imageTiles.length; i++) {
      const imgData = data.imageTiles[i];
      this.eng.tileManager.createTile(imgData);
    }

    // create the entities
    for (let i = 0; i < data.entities.length; i++) {
      const entity = data.entities[i];
      const component = EntityFactory.create(this.eng, entity);
    }
  }

  private async getLevelData(): Promise<LevelData> {
    let data: LevelData;
    // level1
    // level1*

    console.debug('loading scene type: ' + this._type);

    // an '*' after this means it's in local storage
    if (this._type.endsWith('*')) {
      const storage = window.localStorage;
      const dataJson = JSON.parse(storage.getItem(this._type));
      data = new LevelData(dataJson);
    }
    // load the remotely
    else {
      const results = await this.eng.remote.loadFile('assets/' + this._type + '/level.json');
      const dataJson = JSON.parse(results);
      data = new LevelData(dataJson);
    }

    console.debug(data);
    return data;
  }

  /**
   * Handle user input
   * @param action
   * @returns
   */
  handleUserAction(action: InputState): boolean {
    this.inputHud.handleUserAction(action);

    return false;
  }

  update(dt: number): void {
    //this.particleTest.update(dt);
    this.updatableCollisions.forEach((c) => c.update(dt));
  }

  postUpdate(dt: number): void {
    this.inputHud.update(dt);
  }

  dispose(): void {
    this.eng.physicsManager.reset();
    this.eng.annotationManager.reset();
    this.eng.player.reset();
    this.eng.bullets.reset();
    this.eng.enemies.reset();
    //this.eng.backgroundManager.dispose();
  }
}
