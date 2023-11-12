import { SceneComponent } from "../../components/SceneComponent";
import { InputState } from "../../core/InputHandler";
import { ShaderController } from "../../graphics/ShaderController";
import { Texture } from "../../graphics/Texture";
import mat4 from "../../math/mat4";
import vec2 from "../../math/vec2";
import vec3 from "../../math/vec3";
import { SpriteInstanceShader } from "../../shaders/SpriteInstanceShader";

import { PlatformEngine } from "../PlatformEngine";



/**
 * This is the model data that represents a quad
 */
interface IQuadModel {
  /** scale and rotation */
  transform?: mat4;

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
  vertArrayBufferGeometry: WebGLVertexArrayObject;

  verts: Float32Array;
  instances: Float32Array;
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
    this.verts = new Float32Array();
    this.index = new Uint16Array();
    this.instances = new Float32Array();
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

    if (this.verts.length < length * (4 * 5)) {
      this.verts = new Float32Array(length * (4 * 5));
    }

    if (this.index.length < length * 6) {
      this.index = new Uint16Array(length * 6);
    }

    // 16 floats in a mat4
    if (this.instances.length < length * 16) {
      this.instances = new Float32Array(length * 16);
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

    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 1;

    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;

    this.index[indexIndex++] = vertCount + 0;
    this.index[indexIndex++] = vertCount + 1;
    this.index[indexIndex++] = vertCount + 3;

    this.index[indexIndex++] = vertCount + 1;
    this.index[indexIndex++] = vertCount + 2;
    this.index[indexIndex++] = vertCount + 3;

    vertCount += 4;

    for (let i = 0; i < length; i++) {
      const quad = quads[i];
      const trans = quad.transform ?? new mat4();

      // update the instance matrix
      for (let j = 0; j < trans.values.length; j++) {
        this.instances[instanceIndex++] = trans.values[j];
      }
    };

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBufferGeometry);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.verts,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex,
      vertIndex
    );

    // instance buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instances,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex,
      instanceIndex
    );

    // in order for this to work the vertex shader will
    // need to have position
    //  vec3 aPos;
    //  vec2 aTex;
    //
    const positionAttribute = 0;
    const textureAttribute = 1;
    const world1Attribute = 2;
    const world2Attribute = 3;
    const world3Attribute = 4;
    const world4Attribute = 5;
    const color1Attribute = 6;

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3; // position x, y, z
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 5 * 4; // pos(x,y,x) + tex(u,v) * 4 byte float
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(
        positionAttribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(positionAttribute);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 5 * 4; // pos(x,y,x) + tex(u,v) * 4 byte float
      const offset = 3 * 4; // start after the position
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(
        textureAttribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(textureAttribute);
    }

    {

      const numComponents = 4;
      const type = this.gl.FLOAT;
      const normalize = false;
      const step = 4 * 4; // vec4 size
      const stride = step * 4; // mat4  * 4 byte float
      let offset = 0 * step; // start after the position
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
      this.gl.vertexAttribPointer(
        world1Attribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(world1Attribute);
      this.gl.vertexAttribDivisor(world1Attribute, 1);

      offset += step;
      this.gl.vertexAttribPointer(
        world2Attribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(world2Attribute);
      this.gl.vertexAttribDivisor(world2Attribute, 1);

      offset += step;
      this.gl.vertexAttribPointer(
        world3Attribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(world3Attribute);
      this.gl.vertexAttribDivisor(world3Attribute, 1);

      offset += step;
      this.gl.vertexAttribPointer(
        world4Attribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(world4Attribute);
      this.gl.vertexAttribDivisor(world4Attribute, 1);
    }

    // index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.index,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex,
      this.indexCount
    );

    this.gl.bindVertexArray(null);
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
    const transform = new mat4();
    transform.scale(new vec3([500, 500, 1]));
    transform.translate(new vec3([10, 10, 0]));

    this.buffer.setBuffers([{
      transform,
      minTex: new vec2([0, 0]),
      maxTex: new vec2([1, 1]),
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