import { SceneComponent } from "../../components/SceneComponent";
import { InputState } from "../../core/InputState";

import { GlBufferQuadInstance, IQuadModelInstance } from "../../geometry/GlBufferQuadInstance";
import { Texture } from "../../graphics/Texture";
import { toRadian } from "../../math/constants";
import mat2 from "../../math/mat2";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import vec4 from "../../math/vec4";
import { SpriteInstanceShader } from "../../shaders/SpriteInstanceShader";
import { PlatformEngine } from "../PlatformEngine";

export class LevelRenderTest extends SceneComponent {

  private shader: SpriteInstanceShader;
  private buffer: GlBufferQuadInstance;
  private spriteTexture: Texture;
  private quads: IQuadModelInstance[] = [];
  private quadIndex: number = 0;

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.shader = new SpriteInstanceShader(eng.gl, 'instancing');
    this.buffer = new GlBufferQuadInstance(eng.gl);
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
    this.spriteTexture = this.eng.assetManager.menu.texture;
    this.buffer.setBuffers(this.createQuads(0));
  }

  /**
   * Converts textures from pixels to uv space
   * @param spriteX 
   * @param spriteY 
   * @param spriteW 
   * @param spriteH 
   * @returns 
   */
  getMinMax(spriteX: number, spriteY: number, spriteW: number, spriteH: number): { min: vec2, max: vec2 } {
    const sheetW = this.spriteTexture.width;
    const sheetH = this.spriteTexture.height;
    let minX = spriteX / sheetW;
    let minY = 1.0 - spriteY / sheetH;
    let maxX = (spriteX + spriteW) / sheetW;
    let maxY = 1.0 - (spriteY + spriteH) / sheetH;
    return { min: new vec2(minX, minY), max: new vec2(maxX, maxY) };
  }

  createQuads(dt: number): IQuadModelInstance[] {
    this.quadIndex = 0;
    this.createColorColumn(dt);

    return this.quads;
  }

  createColorColumn(dt: number) {


    for (let i = 0; i < 100; i++) {

      const offset = new vec2(-1, 1);
      const translation = new vec3([100, 400, 0]);
      const color = new vec4([.3, .7, .5, .5]);
      const textureMinMax = this.getMinMax(48, 16, 32, 16);

      let quad = this.quads[this.quadIndex++];
      if (!quad) {
        const transform = new mat2();
        transform.scale(new vec2([64, 32]));
        transform.rotate(toRadian(dt));
        this.quads.push(
          {
            rotScale: transform,
            offset,
            translation,
            color,
            minTex: textureMinMax.min,
            maxTex: textureMinMax.max,
          }
        );
      } else {
        quad.rotScale.rotate(toRadian(dt * .1));
        quad.offset = offset;
        quad.translation = translation;
        quad.color = color;
        quad.minTex = textureMinMax.min;
        quad.maxTex = textureMinMax.max;
      }
    }
  }

  /**
   * For testing
   * @param dt 
   */
  update(dt: number): void {
    // clear the buffers
    this.gl.clearColor(0.3, 0.3, 0.5, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.buffer.setBuffers(this.createQuads(dt));

    const view = this.eng.viewManager;
    let projection = view.projection;

    this.shader.setSpriteSheet(this.spriteTexture);
    this.shader.enable();
    // set the project
    this.shader.setProj(projection);

    this.buffer.enable();
    const type = this.gl.UNSIGNED_SHORT;

    this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.buffer.indexCount, type, 0, this.buffer.instanceCount);
  }
}