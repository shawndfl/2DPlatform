import { WorldScene } from '../environment/WorldScene';
import { Editor } from '../editor/Editor';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { InputHandler } from './InputHandler';
import { TileHelper } from '../utilities/TileHelper';
import { UserAction } from './UserAction';
import { SoundManager } from '../systems/SoundManager';
import { ViewManager } from '../systems/ViewManager';
import { DialogManager } from '../systems/DialogManager';
import { TextManager } from '../systems/TextManager';
import FontData from '../assets/font.json';
import { BattleManager } from '../systems/BattleManager';
import { SceneComponent } from '../components/SceneComponent';

import Level1 from '../assets/level1.json';
import { FpsController } from './FpsController';
import { Random } from '../utilities/Random';
import { AssetManager } from '../systems/AssetManager';
import { GameManager } from '../systems/GameManager';
import { TouchManager } from '../systems/TouchManager';
import { CanvasController } from './CanvasController';
import { ILevelData } from '../environment/ILevelData';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  readonly scene: SceneComponent;
  readonly input: InputHandler;
  readonly spritePerspectiveShader: SpritePerspectiveShader;
  readonly tileHelper: TileHelper;
  readonly soundManager: SoundManager;
  readonly viewManager: ViewManager;
  readonly textManager: TextManager;
  readonly dialogManager: DialogManager;
  readonly battleManager: BattleManager;
  readonly gameManager: GameManager;
  readonly fps: FpsController;
  readonly random: Random;
  readonly touchManager: TouchManager;
  readonly assetManager: AssetManager;
  readonly rootElement: HTMLElement;
  readonly canvasController: CanvasController;

  get gl(): WebGL2RenderingContext {
    return this.canvasController.gl;
  }

  /**
   * Tile scale for the game
   */
  get tileScale(): number {
    return 2;
  }

  get width(): number {
    return this.gl.canvas.width;
  }

  get height(): number {
    return this.gl.canvas.height;
  }

  constructor() {
    // create the canvas with the gl context so everything downstream can now use it
    this.canvasController = new CanvasController(this);

    this.random = new Random(1001);
    this.gameManager = new GameManager(this);
    this.scene = new WorldScene(this);
    this.input = new InputHandler(this);
    this.tileHelper = new TileHelper(this);
    this.soundManager = new SoundManager();
    this.viewManager = new ViewManager(this);
    this.dialogManager = new DialogManager(this);
    this.textManager = new TextManager(this);
    this.battleManager = new BattleManager(this);
    this.fps = new FpsController(this);
    this.assetManager = new AssetManager(this);
    this.touchManager = new TouchManager(this);
    this.spritePerspectiveShader = new SpritePerspectiveShader(this.gl, 'spritePerspectiveShader');
  }

  changeScene(level: ILevelData) {
    //TODO load a new scene
  }

  async initialize(rootElement: HTMLElement) {
    this.canvasController.initialize(rootElement);

    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    // NOTE, this must be done before any textures are loaded
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    await this.gameManager.initialize();
    await this.assetManager.initialize();

    await this.textManager.initialize();
    await this.scene.initialize({ level: Level1 });
    await this.dialogManager.initialize();
    await this.battleManager.initialize();

    // some gl setup
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    this.gl.enable(this.gl.BLEND);

    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ZERO);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things
  }

  update(dt: number) {
    // handle gamepad polling
    this.input.preUpdate(dt);

    // update the touch manager
    this.touchManager.update(dt);

    // update the fps
    this.fps.update(dt);

    // handle input
    if (this.input.action != UserAction.None) {
      this.soundManager.UserReady();
      this.scene.handleUserAction({ action: this.input.action, touchPoint: this.input.touchPoint });
    }

    // clear the buffers
    this.gl.clearColor(0.3, 0.3, 0.3, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything

    // update time for game manager
    this.gameManager.update(dt);

    this.battleManager.update(dt);

    // update most of the game components
    this.scene.update(dt);

    // update the menu manager
    this.dialogManager.update(dt);

    // update text manager
    this.textManager.update(dt);

    // used to reset flags and update hold timers
    this.input.postUpdate(dt);
  }

  resize(width: number, height: number) {
    this.scene.resize(width, height);
  }

  dispose() {
    this.scene.dispose();
  }
}
