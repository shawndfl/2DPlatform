import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { InputState } from "../../core/InputHandler";
import { PlayerController } from "../components/PlayerController";
import { GroundManager } from "../system/GroundManager";
import Level1Data from '../assets/levels/level1.json'

export class Level1 extends SceneComponent {


  private _player: PlayerController;
  private _groundManager: GroundManager;

  constructor(eng: Engine) {
    super(eng);
    this._groundManager = new GroundManager(eng);
    this._player = new PlayerController(eng);

  }

  /**
   * Handle user input
   * @param action 
   * @returns 
   */
  handleUserAction(action: InputState): boolean {
    this._player.handleUserAction(action);
    return true;
  }

  initialize(): void {
    this._player.initialize();
    this._groundManager.initialize(Level1Data);
  }

  update(dt: number): void {

    this._player.update(dt);
    this._groundManager.update(dt);
  }
}