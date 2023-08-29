import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';

//
// Vertex Shader program
//
const vsSource = `
attribute vec3 aPos;
attribute vec2 aTex;
varying mediump vec2 vTex;

void main() {
    vTex = aTex;
    vec4 pos = vec4(aPos.xyz, 1.0);
    gl_Position =  pos;
}
`;

//
// Fragment shader program
//
const fsSource = `
varying mediump vec2 vTex;
uniform sampler2D uSampler;

void main() {
  mediump vec4 color = texture2D(uSampler, vTex);

  gl_FragColor = color;
  
}
`;

/**
 * Shader for sprites
 */
export class BackgroundImageShader {
  private _shader: ShaderController;

  private _aPos: number;
  private _aTex: number;
  private _uSampler: number;
  private _texture: Texture;

  constructor(private gl: WebGL2RenderingContext, shaderId: string) {
    this._shader = new ShaderController(this.gl, shaderId);
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._aPos = this._shader.getAttribute('aPos');
    this._aTex = this._shader.getAttribute('aTex');
    this._uSampler = this._shader.getUniform('uSampler');
  }

  setBackgroundImage(texture: Texture) {
    this._texture = texture;
  }

  enable() {
    this._shader.enable();
    if (!this._texture) {
      console.warn('texture is null. Call setSpriteSheet()');
    } else {
      // Bind the texture to texture unit 0
      this._texture.enable(this._uSampler);
    }
  }
}
