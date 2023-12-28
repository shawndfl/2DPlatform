import mat2 from '../math/mat2';
import mat4 from '../math/mat4';
import quat from '../math/quat';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { IQuadModel } from './IQuadMode';

/**
 * Creates a buffer of a quad.
 */
export class GlBuffer2 {
  vertBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vertArrayBuffer: WebGLVertexArrayObject;

  verts: Float32Array;
  index: Uint16Array;

  /** were the buffers created */
  get buffersCreated() {
    return this.vertArrayBuffer != 0;
  }

  /** @type {number} How many indices do we have */
  indexCount: number;
  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl
   */
  constructor(private gl: WebGL2RenderingContext) {
    this.vertBuffer = 0;
    this.indexBuffer = 0;
    this.indexCount = 0;
    this.vertArrayBuffer = 0;
    this.verts = new Float32Array();
    this.index = new Uint16Array();
  }

  /**
   * Creates the buffers
   */
  createBuffer() {
    this.dispose();
    // create vert array buffer
    this.vertArrayBuffer = this.gl.createVertexArray();
    // position buffer
    this.vertBuffer = this.gl.createBuffer();
    // index buffer
    this.indexBuffer = this.gl.createBuffer();
  }

  /**
   * Create the buffer
   * @param quads A array of quads that will be added to this buffer
   * @param isStatic Is this buffer static
   * @returns
   */
  setBuffers(quad: IQuadModel, isStatic: boolean = true) {
    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    if (this.verts.length < 4 * 5) {
      this.verts = new Float32Array(4 * 5);
    }

    if (this.index.length < 6) {
      this.index = new Uint16Array(6);
    }

    // reset counters
    this.indexCount = 6;

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

    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = quad.minTex.x;
    this.verts[vertIndex++] = quad.maxTex.y;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = quad.maxTex.x;
    this.verts[vertIndex++] = quad.maxTex.y;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = quad.maxTex.x;
    this.verts[vertIndex++] = quad.minTex.y;

    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = quad.minTex.x;
    this.verts[vertIndex++] = quad.minTex.y;

    this.index[indexIndex++] = vertCount + 0;
    this.index[indexIndex++] = vertCount + 1;
    this.index[indexIndex++] = vertCount + 3;

    this.index[indexIndex++] = vertCount + 1;
    this.index[indexIndex++] = vertCount + 2;
    this.index[indexIndex++] = vertCount + 3;

    vertCount += 4;

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBuffer);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.verts,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      0,
      vertIndex
    );

    // in order for this to work the vertex shader will
    // need to have position
    //  vec3 aPos;
    //  vec2 aTex;
    //
    const positionAttribute = 0;
    const textureAttribute = 1;

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

    // index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.index,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      0,
      this.indexCount
    );
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
      this.gl.bindVertexArray(this.vertArrayBuffer);
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

    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = 0;
    }

    if (this.vertArrayBuffer) {
      this.gl.deleteVertexArray(this.vertArrayBuffer);
    }

    this.verts = new Float32Array();
    this.index = new Uint16Array();
  }
}
