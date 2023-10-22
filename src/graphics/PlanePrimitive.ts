import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
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
    this.buffer.setBuffers([{ min: new vec3([-1, -1, 0]), max: new vec3([1, 1, 0]), minTex: new vec2([0, 1]), maxTex: new vec2([1, 0]) }]);
  }

  draw() {
    this.buffer.enable();
    const vertexCount = this.buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
