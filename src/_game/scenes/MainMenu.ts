import { InputState } from "../../core/InputHandler";
import BackgroundImage from '../assets/menu/menu.png'
import { SceneComponent } from "../../components/SceneComponent";
import { Engine } from "../../core/Engine";
import { SpritBaseController } from "../../graphics/SpriteBaseController";
import { SpritController } from "../../graphics/SpriteController";
import { Texture } from "../../graphics/Texture";

export class MainMenu extends SceneComponent {

    background: SpritController;

    constructor(eng: Engine) {
        super(eng);
    }

    async ShowScene(): Promise<void> {
        
        // set up the background image
        this.background = new SpritController(this.eng);
        const texture = new Texture(this.gl);
        texture.loadImage(BackgroundImage);

        this.background.initialize(texture, {tiles: [{id:'main', index:[0,0]}], tileHeight: texture.height, tileWidth: texture.width });
        this.background.commitToBuffer();

        // show the dialog
        this.eng.dialogManager.showDialog(
            "Start Game",
            { x: 200, y: 20, width: 300, height: 200 },
            (d) => {
              console.debug("selected " + d.selectedOption);
              if(d.selectedOption == 'New Game') {
                this.eng.SceneManager.changeScene('level1');
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