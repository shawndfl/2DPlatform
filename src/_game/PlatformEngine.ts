import { Engine } from "../core/Engine";
import { ISceneManager } from "../interfaces/ISceneManager";
import { AssetManager } from "../systems/AssetManager";
import { PlayerController } from "./components/PlayerController";
import { GameEditor } from "./editor/GameEditor";
import { GameAssetManager } from "./system/GameAssetManager";
import { GameSceneManager } from "./system/GameSceneManager";
import { GroundManager } from "./system/GroundManager";

/**
 * This is the engine override that will kick off our editor
 * or the game.
 */
export class PlatformEngine extends Engine {
  readonly sceneManager: GameSceneManager;
  readonly editor: GameEditor;
  readonly player: PlayerController;
  readonly groundManager: GroundManager;

  constructor() {
    super();
    this.sceneManager = new GameSceneManager(this);
    this.groundManager = new GroundManager(this);
    this.player = new PlayerController(this);
  }

  createAssetManager(): AssetManager {
    return new GameAssetManager(this);
  }

  async initialize(root?: HTMLElement): Promise<void> {

    if (!root) {
      console.error("cannot find root element");
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

    await this.assetManager.initialize();
    this.groundManager.initialize();
    this.player.initialize();
    //await this.gameManager.initialize();
    await this.textManager.initialize();
    await this.dialogManager.initialize();
    await this.sceneManager.initialize();

    // some gl setup
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    this.gl.enable(this.gl.BLEND);

    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ZERO);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('editor')) {
      const editor = new GameEditor(this);
      await editor.initialize(document.getElementById('rootContainer'));

    }
  }

  update(dt: number): void {
    super.update(dt);

    if (this.editor) {
      this.editor.update(dt);
    }
    this.player.update(dt);
    this.groundManager.update(dt);
  }
}
