import { Component } from '../components/Component';
import vec4 from '../math/vec4';
import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from '../geometry/GlBuffer';
import { IFontData } from './IFontData';
import { ITextModel } from './ITextModel';
import vec3 from '../math/vec3';
import vec2 from '../math/vec2';

export class TextController extends Component {
  buffer: GlBuffer;
  color: vec4;

  constructor(eng: Engine, private fontData: IFontData[]) {
    super(eng);
    // Create a new buffer
    this.buffer = new GlBuffer(this.gl);
  }

  /**
   * Initialize a new text block
   * @param block Text properties
   * @param lineHeight The height of the tallest character in pixels
   */
  initialize(block: ITextModel, lineHeight: number) {
    const screenHeight = this.eng.height;
    const screenWidth = this.eng.width;

    const originX = block.position.x;
    const originY = this.eng.height - block.position.y;
    let offsetX = originX;
    let offsetY = originY;
    let xpos1 = offsetX;
    let ypos1 = offsetY;
    let xpos2 = offsetX;
    let ypos2 = offsetY;

    this.color = block.color;
    const zpos = block.depth;
    let charCount = 0;
    const text = block.text;

    // if the text is empty there is nothing to do
    if (!text) {
      return;
    }

    const quads: IQuadModel[] = [];

    // loop over all the characters in the text block
    // and create geometry for them.
    for (let i = 0; i < text.length; i++) {
      // get the character
      let ch = text.charAt(i);

      // check for new line and out of range
      if (ch == '\n') {
        offsetY -= lineHeight;
        offsetX = originX;
        continue;
      } else if (ch < ' ' || ch > '~') {
        ch = '?';
      }

      const font = this.fontData.find((value) => value.ch == ch);

      if (!font) {
        console.warn("Don't have data for ch: " + ch);
      }

      xpos1 = offsetX + font.bearingX;
      ypos1 = offsetY - (font.sizeY - font.bearingY); // bottom of the letter

      xpos2 = offsetX + block.scale * font.advance;
      ypos2 = offsetY + block.scale * font.bearingY; // top of the letter

      // set for the next letter
      offsetX = xpos2;

      const tu1 = font.u1;
      const tv1 = 1 - font.v2;
      const tu2 = font.u2;
      const tv2 = 1 - font.v1;

      const quad: IQuadModel = {
        min: new vec3([(xpos1 / screenWidth) * 2 - 1.0, (ypos1 / screenHeight) * 2 - 1.0, zpos]),
        max: new vec3([(xpos2 / screenWidth) * 2 - 1.0, (ypos2 / screenHeight) * 2 - 1.0, zpos]),
        minTex: new vec2([tu1, tv2]),
        maxTex: new vec2([tu2, tv1]),
      };

      charCount++;

      quads.push(quad);
    }

    this.buffer.setBuffers(quads, false);
  }

  /**
   * Updates the text animations.
   * @param {float} dt Delta time in ms
   */
  update(dt: number) {
    if (this.buffer.buffersCreated) {
      // enable the buffer
      this.buffer.enable();

      {
        const vertexCount = this.buffer.indexCount;
        const type = this.gl.UNSIGNED_SHORT;
        const offset = 0;
        this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
      }
    }
  }

  dispose(): void {
    if (this.buffer) {
      this.buffer.dispose();
    }
  }

}
