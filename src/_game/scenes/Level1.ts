import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { InputState } from "../../core/InputHandler";
import { PlayerController } from "../components/PlayerController";
import { GroundManager } from "../system/GroundManager";
import Level1Data from '../assets/levels/level1.json'
import { PlatformEngine } from "../PlatformEngine";
import { LineComponent } from "../../components/LineComponent";

export class Level1 extends SceneComponent {
  private line: LineComponent;

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.eng.viewManager.minX = 0;
    this.eng.viewManager.maxX = 1000;
    this.line = new LineComponent(eng);
  }

  initialize(): void {
    this.eng.groundManager.loadLevel(Level1Data);
    this.line.initialize();

    // set the texture for the particle manager
    this.eng.particleManager.setTexture(this.eng.assetManager.menu.texture);
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
    this.line.update(dt);
  }
}