import { SceneComponent } from "../../components/SceneComponent";
import Level1Data from '../assets/levels/level1.json'
import { PlatformEngine } from "../PlatformEngine";
import { LineComponent } from "../../components/LineComponent";
import { InputState } from "../../core/InputState";
import { InputCalibration } from "../../core/InputCalibration";

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