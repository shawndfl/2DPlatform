import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { InputState } from "../../core/InputHandler";
import { PlayerController } from "../components/PlayerController";
import { GroundManager } from "../system/GroundManager";
import Level1Data from '../assets/levels/level1.json'
import { PlatformEngine } from "../PlatformEngine";

export class Level1 extends SceneComponent {
  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);

  }

  /**
   * Handle user input
   * @param action 
   * @returns 
   */
  handleUserAction(action: InputState): boolean {
    return false;
  }

  initialize(): void {
    this.eng.groundManager.loadLevel(Level1Data);
  }

  update(dt: number): void {

  }
}