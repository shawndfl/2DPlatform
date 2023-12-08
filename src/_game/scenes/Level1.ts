import { SceneComponent } from "../../components/SceneComponent";
import Level1Data from '../assets/levels/level1.json'
import { PlatformEngine } from "../PlatformEngine";
import { LineComponent } from "../../components/LineComponent";
import { InputState } from "../../core/InputState";
import { InputCalibration } from "../../core/InputCalibration";
import { QuadTree, QuadTreeAnalytics } from "../../physics/QuadTree";
import { Collision2D } from "../../physics/Collision2D";
import rect from "../../math/rect";

export class Level1 extends SceneComponent {

  private inputCal: InputCalibration;

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.eng.viewManager.minX = 0;
    this.eng.viewManager.maxX = 1000;

    this.inputCal = new InputCalibration(eng);
  }

  initialize(): void {
    this.eng.groundManager.loadLevel(Level1Data);


    // set the texture for the particle manager
    this.eng.particleManager.setTexture(this.eng.assetManager.menu.texture);
    /*
        this.eng.dialogManager.showDialog('Welcome:', { x: 100, y: 100, width: 500, height: 300 }, (d) => {
          console.debug('Selected ' + d.selectedOption);
          if (d.selectedOption == "Input Mapping") {
            this.startCalibration();
    
          }
    
        }, ["Start", "Input Mapping"], undefined, -.5);
        */

    //Test
    ///
    //const tree = new QuadTree(500, 5);
    /*
        // create a 10 x 10 grid of 2x2 colliders
        const step = 2;
        const maxCollision = 100;
        for (let i = 0; i < maxCollision; i++) {
          for (let j = 0; j < maxCollision; j++) {
            const id = 'test_' + i + ',' + j;
            const collision = new Collision2D(null, id, null, new rect([i * step, step, (maxCollision - j) * step, step]));
            tree.addCollision(collision);
          }
        }
        const testBlock = new Collision2D(null, 'test', null, new rect([0, 1, 1, 1]));
    
        var t0 = performance.now();
        let analytics: QuadTreeAnalytics = { intersectionTests: 0, nodesTested: 0 };
        let results = tree.checkForCollision(testBlock, undefined, analytics);
        var t1 = performance.now();
    
        console.debug(' analytics ', analytics, results);
        console.debug(' time quad tree: ', (t1 - t0));
        console.debug('quadTree ', tree);
    */
  }

  private startCalibration(): void {
    this.inputCal.beginCalibration(this.inputCalibrationStep.bind(this));
  }

  private inputCalibrationStep(stepName: string, button: string, nextStep: string): void {
    this.eng.dialogManager.showDialog('Mapping key:' + stepName + ' to button ' + button, { x: 100, y: 100, width: 200, height: 100 }, (d) => {
      console.debug('Selected ' + d.selectedOption);
    });
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

    this.inputCal.update(dt);
  }
}