import { SceneComponent } from "../../components/SceneComponent";
import { InputState } from "../../core/InputHandler";
import { Texture } from "../../graphics/Texture";
import mat2 from "../../math/mat2";
import vec2 from "../../math/vec2";
import vec4 from "../../math/vec4";
import { SpriteInstanceShader } from "../../shaders/SpriteInstanceShader";
import { PlatformEngine } from "../PlatformEngine";

/**
 * This is the model data that represents a quad
 */
interface IQuadModel {
  /** scale and rotation */
  //transform?: mat4;

  rotScale: mat2;

  translation: vec4;

  color: vec4;

  /** min texture (u,v) in uv space -1 to 1 */
  minTex: vec2;

  /** max texture (u,v) in uv space -1 to 1 */
  maxTex: vec2;
}



/**
 * Creates a buffer of a quad.
 */
class GlBuffer2 {
  vertBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
  textureCoordBuffer: WebGLBuffer;
  vertArrayBufferGeometry: WebGLVertexArrayObject;

  verts: Float32Array;
  instances: Float32Array;
  textureCoords: Float32Array;
  index: Uint16Array;

  /** were the buffers created */
  get buffersCreated() {
    return this.vertArrayBufferGeometry != 0;
  }

  /** @type {number} How many indices do we have */
  indexCount: number;

  instanceCount: number;
  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl
   */
  constructor(private gl: WebGL2RenderingContext) {
    this.vertBuffer = 0;
    this.indexBuffer = 0;
    this.indexCount = 0;
    this.instanceCount = 0;
    this.vertArrayBufferGeometry = 0;
    this.instanceBuffer = 0;
    this.textureCoordBuffer = 0
    this.verts = new Float32Array();
    this.index = new Uint16Array();
    this.instances = new Float32Array();
    this.textureCoords = new Float32Array();
  }

  /**
   * Creates the buffers
   */
  createBuffer() {
    this.dispose();
    // create vert array buffer
    this.vertArrayBufferGeometry = this.gl.createVertexArray();
    // position buffer
    this.vertBuffer = this.gl.createBuffer();

    // index buffer
    this.indexBuffer = this.gl.createBuffer();

    // instance buffer
    this.instanceBuffer = this.gl.createBuffer();

    // used to hold the texture coordinates
    this.textureCoordBuffer = this.gl.createBuffer();
  }

  /**
   * Create the buffer
   * @param quads A array of quads that will be added to this buffer
   * @param isStatic Is this buffer static
   * @returns
   */
  setBuffers(
    quads: IQuadModel[],
    isStatic: boolean = true,
    bufferIndex: number = 0,
    quadLength?: number
  ) {

    const length = this.instanceCount = quadLength ?? quads.length;

    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    // make sure the buffers have enough space for data needed to create each quad
    if (this.verts.length < length * 3 * 4) {
      this.verts = new Float32Array(length * 3 * 4);
    }

    if (this.index.length < length * 6) {
      this.index = new Uint16Array(length * 6);
    }

    // this will hold transform (mat2), translation (vec4), and color(vec4)
    // vec4 * 3 = 12 floats
    if (this.instances.length < length * 12) {
      this.instances = new Float32Array(length * 12);
    }

    if (this.textureCoords.length < length * 2 * 4) {
      this.textureCoords = new Float32Array(length * 2 * 4);
    }

    // reset counters
    this.indexCount = length * 6;

    //               Building a quad
    //
    //    Pos[-1, 1]                Texture [0,1]
    //   p0---------p1 (max)      p0 ---------p1 (max)
    //   |        / |              |        / |
    //   |      /   |              |      /   |
    //   |    /     |              |    /     |
    //   |  /       |              |  /       |
    //   p3---------p2             p3---------p2
    //  (min)                      (min)
    //
    let vertCount = 0;
    let vertIndex = 0;
    let indexIndex = 0;
    let instanceIndex = 0;
    let textureCoordIndex = 0;

    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;

    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;

    this.index[indexIndex++] = vertCount + 0;
    this.index[indexIndex++] = vertCount + 1;
    this.index[indexIndex++] = vertCount + 3;

    this.index[indexIndex++] = vertCount + 1;
    this.index[indexIndex++] = vertCount + 2;
    this.index[indexIndex++] = vertCount + 3;

    vertCount += 4;

    for (let i = 0; i < length; i++) {
      const quad = quads[i];
      const rotScale = quad.rotScale ?? new mat2();
      const translate = quad.translation ?? new vec4();
      const color = quad.color;

      // texture coordinates are stored in a separate buffer because 
      // they can be updated dynamically and will be different for each quad.
      this.textureCoords[textureCoordIndex++] = quad.minTex.x;
      this.textureCoords[textureCoordIndex++] = quad.maxTex.y;

      this.textureCoords[textureCoordIndex++] = quad.maxTex.x;
      this.textureCoords[textureCoordIndex++] = quad.maxTex.y;

      this.textureCoords[textureCoordIndex++] = quad.maxTex.x;
      this.textureCoords[textureCoordIndex++] = quad.minTex.y;

      this.textureCoords[textureCoordIndex++] = quad.minTex.x;
      this.textureCoords[textureCoordIndex++] = quad.minTex.y;

      // rotate scale mat 2
      rotScale.foreach(val => this.instances[instanceIndex++] = val);
      // translation vec4
      translate.foreach(val => this.instances[instanceIndex++] = val);
      // color scale vec4
      color.foreach(val => this.instances[instanceIndex++] = val);

    };

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBufferGeometry);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.verts,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
    );

    // create a buffer for texture coordinates
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.textureCoords,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
    );

    // instance buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instances,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
    );

    // index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.index,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
    );

    // in order for this to work the vertex shader will
    // need to have position
    //  vec3 aPos;
    //  vec2 aTex;
    //  mat2 aTransform;
    //  vec4 aTranslate;
    //  vec4 aColorScale;
    this.positionAttribute();
    this.textureAttribute();
    this.transformAttribute();
    this.translateAttribute();
    this.colorScaleAttribute();
    this.gl.bindVertexArray(null);
  }

  positionAttribute(): void {
    const index = 0;
    const numComponents = 3; // position x, y, z
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 3 * 4; // pos(x,y,x) * 4 byte float
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.vertexAttribPointer(
      index,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(index);
  }

  textureAttribute(): void {
    const index = 1;
    const numComponents = 2; // texture u,v
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 2 * 4; // tx(u,v) * 4 byte float
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
    this.gl.vertexAttribPointer(
      index,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(index);
  }

  transformAttribute(): void {
    const index = 2;
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const step = 4 * 4; // mat2 size * 4 byte float
    const stride = step * 3; // step * 3 (vec4)
    let offset = 0 * step; // start after the position
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.vertexAttribPointer(
      index,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(index);
    this.gl.vertexAttribDivisor(index, 1);
  }

  translateAttribute(): void {
    const index = 3;
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const step = 4 * 4; // vec4 size * 4 byte float
    const stride = step * 3; // step * 3 (vec4)
    let offset = 1 * step; // start after the position
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.vertexAttribPointer(
      index,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(index);
    this.gl.vertexAttribDivisor(index, 1);
  }

  colorScaleAttribute(): void {
    const index = 4;
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const step = 4 * 4; // vec4 size * 4 byte float
    const stride = step * 3; // step * 3 (vec4)
    let offset = 2 * step; // start after the position
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.vertexAttribPointer(
      index,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(index);
    this.gl.vertexAttribDivisor(index, 1);
  }

  /**
   * Enable vertex attributes and element buffer
   */
  enable() {
    if (!this.buffersCreated) {
      console.error('buffers were not created!');
    } else {
      // the vertex and index buffer are grouped with this so we only need
      // to enable this array buffer
      this.gl.bindVertexArray(this.vertArrayBufferGeometry);
    }
  }

  /**
   * Clean up buffer
   */
  dispose() {
    if (this.vertBuffer) {
      this.gl.deleteBuffer(this.vertBuffer);
      this.vertBuffer = 0;
    }

    if (this.instanceBuffer) {
      this.gl.deleteBuffer(this.instanceBuffer);
      this.instanceBuffer = 0;
    }

    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = 0;
    }

    if (this.vertArrayBufferGeometry) {
      this.gl.deleteVertexArray(this.vertArrayBufferGeometry);
    }

    this.verts = new Float32Array();
    this.index = new Uint16Array();
  }
}

export class LevelRenderTest extends SceneComponent {

  private shader: SpriteInstanceShader;
  private buffer: GlBuffer2;
  private spriteTexture: Texture;

  get eng(): PlatformEngine {
    return super.eng as PlatformEngine;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this.shader = new SpriteInstanceShader(eng.gl, 'instancing');
    this.buffer = new GlBuffer2(eng.gl);
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
    const transform = new mat2();
    transform.scale(new vec2([100, 100]));
    transform.rotate(45);

    const spriteX = 48;
    const spriteY = 16;
    const spriteW = 32;
    const spriteH = 16;
    const sheetW = this.spriteTexture.width;
    const sheetH = this.spriteTexture.height;
    let minX = spriteX / sheetW;
    let minY = 1.0 - spriteY / sheetH;
    let maxX = (spriteX + spriteW) / sheetW;
    let maxY = 1.0 - (spriteY + spriteH) / sheetH;

    this.buffer.setBuffers([{
      rotScale: transform,
      translation: new vec4([250, 400, 0, 0]),
      color: new vec4([.3, .7, .5, .5]),
      minTex: new vec2([minX, minY]),
      maxTex: new vec2([maxX, maxY]),
    }])
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