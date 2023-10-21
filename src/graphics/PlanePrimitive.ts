import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { GlBuffer } from '../geometry/GlBuffer';

/**
 * Plane primitive located at -1,-1,0 and 1,1,0 on the xy plane. Also has texture coordinate.
 */
export class PlanePrimitive extends Component {
  private buffer: GlBuffer;

  constructor(eng: Engine) {
    super(eng);
    this.buffer = new GlBuffer(this.eng.gl);
  }

  initialize() {
    this.buffer.setBuffers([{ min: [-1, -1, 0], max: [1, 1, 0], minTex: [0, 1], maxTex: [1, 0] }]);
  }

  draw() {
    this.buffer.enable();
    const vertexCount = this.buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
