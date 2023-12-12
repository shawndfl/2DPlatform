import { SceneComponent } from '../../components/SceneComponent';
import Level1Data from '../assets/levels/level1.json';
import { PlatformEngine } from '../PlatformEngine';
import { LineComponent } from '../../components/LineComponent';
import { InputState } from '../../core/InputState';
import { InputCalibration } from '../../core/InputCalibration';
import { QuadTree, QuadTreeAnalytics } from '../../physics/QuadTree';
import { Collision2D } from '../../physics/Collision2D';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { Curve, CurveType } from '../../math/Curve';

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

  lineAnimationSetup(): void {
    this.curve.points([
      {
        p: -300,
        t: 0,
      },
      {
        p: 2000,
        t: 2000,
      },
    ]);
    this.curve.curve(CurveType.linear);
    this.curve.repeat(-1);
    this.curve.pingPong(true);
    this.curve.start(true);
  }

  p0 = new vec2(400, 50);
  p1 = new vec2(600, 50);
  p2 = new vec2(450, 250);
  p3 = new vec2(450, 0);
  curve: Curve = new Curve();

  lineAnimation(dt: number): void {
    this.curve.update(dt);
    this.p2.x = this.curve.getValue();
    this.p0.y = this.curve.getValue() * 0.2;

    this.eng.annotationManager.buildLine({
      id: 'line1',
      start: this.p0,
      end: this.p1,
      color: new vec4([0, 1, 0, 1]),
    });

    this.eng.annotationManager.buildLine({
      id: 'line2',
      start: this.p2,
      end: this.p3,
      color: new vec4([0, 1, 1, 1]),
    });

    // find the intersection
    const point = vec2.lineIntersectionLine(this.p0, this.p1, this.p2, this.p3);

    if (point) {
      this.eng.annotationManager.buildRect(
        'intersection',
        new rect([point.x - 5, 10, point.y + 5, 10]),
        new vec4([1, 1, 1, 1])
      );
    } else {
      this.eng.annotationManager.removeRect('intersection');
    }
  }

  initialize(): void {
    this.eng.groundManager.loadLevel(Level1Data);

    this.lineAnimationSetup();
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
    /*
    const tree = new QuadTree(300, 3);
    
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

  private inputCalibrationStep(
    stepName: string,
    button: string,
    nextStep: string
  ): void {
    this.eng.dialogManager.showDialog(
      'Mapping key:' + stepName + ' to button ' + button,
      { x: 100, y: 100, width: 200, height: 100 },
      (d) => {
        console.debug('Selected ' + d.selectedOption);
      }
    );
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
    this.lineAnimation(dt);
  }
}
