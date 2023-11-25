import { InputState } from '../../core/InputState';
import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritController } from "../../graphics/SpriteController";
import { Texture } from "../../graphics/Texture";
import vec2 from "../../math/vec2";
import { AssetManager } from "../../systems/AssetManager";

export class MainMenu extends SceneComponent {

  background: SpritController;

  constructor(eng: Engine) {
    super(eng);
  }

  initialize(): void {

    // set up the background image
    this.background = new SpritController(this.eng);
    const texture = this.eng.assetManager.menu.texture;

    this.background.initialize(texture, { tiles: [{ id: 'main', index: [0, 0] }], tileHeight: texture.height, tileWidth: texture.width });
    const scaleX = this.eng.width / texture.width;
    const scaleY = this.eng.height / texture.height;
    this.background.setSpritePosition(0, 0, 0);
    this.background.setSprite(0);
    this.background.scale(new vec2(scaleX, scaleY));
    this.background.viewOffset(new vec2(0, 0));

    // show the dialog
    this.eng.dialogManager.showDialog(
      "Start Game",
      { x: 200, y: 20, width: 300, height: 200 },
      (d) => {
        console.debug("selected " + d.selectedOption);
        if (d.selectedOption == 'New Game') {
          this.eng.sceneManager.changeScene('level1');
        }
        return true;
      },
      ["New Game", "Load", "Edit Level"]
    );
  }

  HideScene(): void {

  }

  update(dt: number): void {
    this.background.update(dt);
  }

}