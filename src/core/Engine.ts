import { FpsController } from './FpsController';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { AssetManager } from '../systems/AssetManager';
import { GameManager } from '../systems/GameManager';
import { TextManager } from '../systems/TextManager';
import { ViewManager } from '../systems/ViewManager';
import { Random } from '../utilities/Random';
import { CanvasController } from './CanvasController';
import { InputHandler } from './InputHandler';
import { InputState } from './InputState';
import { SoundManager } from '../systems/SoundManager';
import { DialogManager } from '../systems/DialogManager';
import { ISceneManager } from '../interfaces/ISceneManager';
import { ParticleManager } from '../systems/ParticleManager';
import { PhysicsManager } from '../systems/PhysicsManager';
import { AnnotationManager } from '../systems/AnnotationManager';

/**
 * The engine for this game. There is one instance of this
 * that is passed to every component. From there each component
 * can access the engine.
 */
export abstract class Engine {
  readonly input: InputHandler;
  readonly spritePerspectiveShader: SpritePerspectiveShader;
  readonly soundManager: SoundManager;
  readonly canvasController: CanvasController;
  readonly viewManager: ViewManager;
  readonly textManager: TextManager;
  readonly gameManager: GameManager;
  readonly fps: FpsController;
  readonly random: Random;
  readonly assetManager: AssetManager;
  readonly rootElement: HTMLElement;
  readonly dialogManager: DialogManager;
  readonly particleManager: ParticleManager;
  readonly physicsManager: PhysicsManager;
  readonly annotationManager: AnnotationManager;

  abstract get sceneManager(): ISceneManager;

  get width(): number {
    return this.gl.canvas.width;
  }

  get height(): number {
    return this.gl.canvas.height;
  }

  get gl(): WebGL2RenderingContext {
    return this.canvasController.gl;
  }

  constructor() {
    // create the canvas with the gl context so everything downstream can now use it
    this.canvasController = new CanvasController(this);
    this.random = new Random(1001);
    this.gameManager = new GameManager(this);

    this.input = new InputHandler(this);
    this.dialogManager = new DialogManager(this);
    this.soundManager = new SoundManager();
    this.viewManager = new ViewManager(this);
    this.textManager = new TextManager(this);
    this.fps = new FpsController(this);
    this.assetManager = this.createAssetManager();
    this.spritePerspectiveShader = new SpritePerspectiveShader(
      this.gl,
      'spritePerspectiveShader'
    );
    this.particleManager = new ParticleManager(this);
    this.physicsManager = new PhysicsManager(this);
    this.annotationManager = new AnnotationManager(this);
  }

  createAssetManager(): AssetManager {
    return new AssetManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {
    if (!root) {
      console.error('cannot find root element');
    }
    this.canvasController.initialize(root);

    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    // NOTE, this must be done before any textures are loaded
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    //await this.gameManager.initialize();
    await this.assetManager.initialize();
    await this.textManager.initialize();
    await this.dialogManager.initialize();
    await this.sceneManager.initialize();
    await this.particleManager.initialize();
    await this.physicsManager.initialize();
    await this.annotationManager.initialize();

    // some gl setup
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    this.gl.enable(this.gl.BLEND);

    this.gl.blendFuncSeparate(
      this.gl.SRC_ALPHA,
      this.gl.ONE_MINUS_SRC_ALPHA,
      this.gl.ONE,
      this.gl.ONE_MINUS_SRC_ALPHA
    );
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things
  }

  handleUserAction(state: InputState): boolean {
    return (
      this.dialogManager.handleUserAction(state) ||
      this.sceneManager.scene.handleUserAction(state)
    );
  }

  gameUpdate(dt: number) {
    this.physicsManager.update(dt);
    this.sceneManager.update(dt);
    this.particleManager.update(dt);
    this.dialogManager.update(dt);
    this.textManager.update(dt);
    this.annotationManager.update(dt);
  }

  update(dt: number): void {
    // handle gamepad polling
    this.input.preUpdate(dt);

    // update the fps
    this.fps.update(dt);

    // handle input

    this.soundManager.UserReady();
    const inputState = this.input.getInputState();
    // handle dialog input first
    this.handleUserAction(inputState);

    // clear the buffers
    this.gl.clearColor(0.3, 0.3, 0.3, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gameUpdate(dt);

    this.input.postUpdate(dt);
  }

  resize(width: number, height: number): void {}

  dispose() {}
}
