import { Primitive, VertexFormat } from "./Primitive";

/**
 * This is the model data that represents a quad
 */
export interface IQuadModel {
  /**min (x,y) corner of the quad in screen space -1 t0 1 */
  min: [number, number, number];

  /**min (x,y) corner of the quad in screen space -1 t0 1 */
  max: [number, number, number];

  /** min texture (u,v) in uv space -1 to 1 */
  minTex: [number, number];

  /** max texture (u,v) in uv space -1 to 1 */
  maxTex: [number, number];
}

/**
 * Creates a buffer of a quad.
 */
export class GlBuffer {
  vertBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vertArrayBuffer: WebGLVertexArrayObject;

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
  setBuffersForPrimitive(primitive: Primitive, isStatic: boolean = true, bufferIndex: number = 0) {

    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    // reset counters
    this.indexCount = 0;

    // save the index count for rendering
    this.indexCount = primitive.indices.length;

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBuffer);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(primitive.verts),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);

    let vertexAttribute = 0;
    let offset = 0;
    const floatSize = 4;
    // pos
    if ((primitive.format & VertexFormat.Pos) > 0) {
      const numComponents = 3;
      this.gl.vertexAttribPointer(
        vertexAttribute,
        numComponents,
        this.gl.FLOAT,
        false,
        primitive.stride,
        offset
      );
      this.gl.enableVertexAttribArray(vertexAttribute);
      // goto the next position attribute index
      vertexAttribute++;
      offset += numComponents * floatSize;
    }
    // color
    if ((primitive.format & VertexFormat.Color4) > 0) {
      const numComponents = 4;
      this.gl.vertexAttribPointer(
        vertexAttribute,
        numComponents,
        this.gl.FLOAT,
        false,
        primitive.stride,
        offset
      );
      this.gl.enableVertexAttribArray(vertexAttribute);
      // goto the next position attribute index
      vertexAttribute++;
      offset += numComponents * floatSize;
    }

    // normal
    if ((primitive.format & VertexFormat.Normal) > 0) {
      const numComponents = 3;
      const stride = primitive.stride;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(
        vertexAttribute,
        numComponents,
        this.gl.FLOAT,
        false,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(vertexAttribute);
      // goto the next position attribute index
      vertexAttribute++;
      offset += numComponents * floatSize;
    }


    // index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(primitive.indices),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
    );
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
    bufferIndex: number = 0
  ) {
    // Now create an array of positions for the square.
    const verts: number[] = [];
    const index: number[] = [];

    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    // reset counters
    this.indexCount = 0;

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
    quads.forEach((quad) => {
      verts.push(quad.min[0], quad.min[1], quad.min[2]);
      verts.push(quad.minTex[0], quad.maxTex[1]);

      verts.push(quad.max[0], quad.min[1], quad.min[2]);
      verts.push(quad.maxTex[0], quad.maxTex[1]);

      verts.push(quad.max[0], quad.max[1], quad.max[2]);
      verts.push(quad.maxTex[0], quad.minTex[1]);

      verts.push(quad.min[0], quad.max[1], quad.max[2]);
      verts.push(quad.minTex[0], quad.minTex[1]);

      index.push(vertCount + 0);
      index.push(vertCount + 1);
      index.push(vertCount + 3);

      index.push(vertCount + 1);
      index.push(vertCount + 2);
      index.push(vertCount + 3);

      vertCount += 4;
    });

    // save the index count for rendering
    this.indexCount = index.length;

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBuffer);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(verts),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
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
      new Uint16Array(index),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex
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
  }
}
