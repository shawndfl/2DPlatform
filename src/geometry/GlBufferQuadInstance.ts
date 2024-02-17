import mat2 from '../math/mat2';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { IQuadModel } from './IQuadMode';

/**
 * Creates a buffer of a quad.
 */
export class GlBufferQuadInstance {
  vertBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
  vertArrayBufferGeometry: WebGLVertexArrayObject;

  verts: Float32Array;
  instances: Float32Array;
  index: Uint16Array;

  pointersSet: boolean;

  /** were the buffers created */
  get buffersCreated() {
    return this.vertArrayBufferGeometry != 0;
  }

  /** How many indices do we have */
  indexCount: number;

  /** Number of instances */
  instanceCount: number;

  /**
   * Constructor
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
  setBuffers(quads: IQuadModel[]) {
    const length = (this.instanceCount = quads.length);

    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    // make sure the buffers have enough space for data needed to create each quad
    // pos (x,y,z), tex (u,v) size of each float is 4
    if (this.verts.length < length * (3 + 2) * 4) {
      this.verts = new Float32Array(length * (3 + 2) * 4);
    }

    if (this.index.length < length * 6) {
      this.index = new Uint16Array(length * 6);
    }

    // this will hold transform (mat2), offset (vec2) translation (vec3), color(vec4), and uvTransform(vec4)
    // size of each float is 4
    if (this.instances.length < length * (4 + 2 + 3 + 4 + 3) * 4) {
      this.instances = new Float32Array(length * (4 + 2 + 3 + 4 + 3) * 4);
    }

    // reset counters
    this.indexCount = length * 6;

    //               Building a quad
    //
    //    Pos[-1, 1]               Texture [0,0]
    //   p3---------p2 (max)      p0 ---------p2
    //   |        / |              |        / |
    //   |      /   |              |      /   |
    //   |    /     |              |    /     |
    //   |  /       |              |  /       |
    //   p0---------p1             p0---------p1(max)
    //  (min)
    //
    let vertCount = 0;
    let vertIndex = 0;
    let indexIndex = 0;
    let instanceIndex = 0;

    // pos x,y,z, u,v
    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 1;

    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;

    this.verts[vertIndex++] = -1;
    this.verts[vertIndex++] = 1;
    this.verts[vertIndex++] = 0;
    this.verts[vertIndex++] = 0;
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
      const translate = quad.translation ?? new vec3();
      const offset = quad.offset ?? new vec2();
      const color = quad.color;
      const uvTransform = new vec4([
        quad.maxTex.x - quad.minTex.x,
        quad.maxTex.y - quad.minTex.y,
        quad.minTex.x,
        quad.minTex.y,
      ]);

      // rotate scale mat 2
      rotScale.foreach((val) => (this.instances[instanceIndex++] = val));
      // offset vec2
      offset.foreach((val) => (this.instances[instanceIndex++] = val));
      // translation vec3
      translate.foreach((val) => (this.instances[instanceIndex++] = val));
      // color scale vec4
      color.foreach((val) => (this.instances[instanceIndex++] = val));
      // uv scale, uv translation vec4
      uvTransform.foreach((val) => (this.instances[instanceIndex++] = val));
    }

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBufferGeometry);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.verts,
      this.gl.STATIC_DRAW,
      0
    );

    // instance buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instances,
      this.gl.DYNAMIC_DRAW,
      0
    );

    // index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.index,
      this.gl.STATIC_DRAW,
      0
    );

    // in order for this to work the vertex shader will
    // need to have position
    //  vec3 aPos;
    //  vec2 aTex;
    //  mat2 aTransform;
    //  vec2 aOffset;
    //  vec3 aTranslate;
    //  vec4 aColorScale;
    //  vec4 aTextureTransform
    if (!this.pointersSet) {
      this.positionAttribute();
      this.textureAttribute();
      // instancing
      this.transformAttribute();
      this.offsetAttribute();
      this.translateAttribute();
      this.colorScaleAttribute();
      this.uvTransformAttribute();
      this.pointersSet = true;
    }
    this.gl.bindVertexArray(null);
  }

  private positionAttribute(): void {
    const index = 0;
    const numComponents = 3; // position x, y, z
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (3 + 2) * 4; // pos(x,y,x) + tex(u,v) * 4 byte float
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

  private textureAttribute(): void {
    const index = 1;
    const numComponents = 2; // texture u,v
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (3 + 2) * 4; // pos(x,y,x) * 4 byte float
    const offset = 3 * 4;
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

  private transformAttribute(): void {
    const index = 2;
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (4 + 2 + 3 + 4 + 4) * 4; // (transform (mat2) + offset (vec2) + trans(vec3) + color(vec4) + uv(vec4)) * byte of float
    let offset = 0;
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

  private offsetAttribute(): void {
    const index = 3;
    const numComponents = 2;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (4 + 2 + 3 + 4 + 4) * 4; // (transform (mat2) + offset (vec2) + trans(vec3) + color(vec4) + uv(vec4)) * byte of float
    let offset = 4 * 4; // after mat2
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

  private translateAttribute(): void {
    const index = 4;
    const numComponents = 3;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (4 + 2 + 3 + 4 + 4) * 4; // (transform (mat2) + offset (vec2) + trans(vec3) + color(vec4) + uv(vec4)) * byte of float
    let offset = (4 + 2) * 4;
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

  private colorScaleAttribute(): void {
    const index = 5;
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (4 + 2 + 3 + 4 + 4) * 4; // (transform (mat2) + offset (vec2) + trans(vec3) + color(vec4) + uv(vec4)) * byte of float
    let offset = (4 + 2 + 3) * 4;
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

  private uvTransformAttribute(): void {
    const index = 6;
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = (4 + 2 + 3 + 4 + 4) * 4; // (transform (mat2) + offset (vec2) + trans(vec3) + color(vec4) + uv(vec4)) * byte of float
    let offset = (4 + 2 + 3 + 4) * 4;
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
  enable(): boolean {
    if (!this.buffersCreated) {
      console.debug('buffers were not created!');
      return false;
    } else {
      // the vertex and index buffer are grouped with this so we only need
      // to enable this array buffer
      this.gl.bindVertexArray(this.vertArrayBufferGeometry);
      return true;
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
