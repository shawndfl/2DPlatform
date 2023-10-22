import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { InputState } from "../../core/InputHandler";
import { PlayerController } from "../components/PlayerController";

export class Level1 extends SceneComponent {


  private _player: PlayerController;

  constructor(eng: Engine) {
    super(eng);

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
  }

  update(dt: number): void {

    this._player.update(dt);
  }
}