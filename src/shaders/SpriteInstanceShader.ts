import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';

//
// Vertex Shader program
//
const vsSource = `
attribute vec3 aPos;
attribute vec2 aTex;
attribute vec4 aInstanceWorld;
attribute vec2 aOffset;
attribute vec3 aTranslate;
attribute vec4 aColorScale;
attribute vec4 aTextureTransform;
uniform mat4 uProj;
varying mediump vec2 vTex;
varying mediump vec4 vColorScale;
varying mediump vec3 depth;

void main() {
    vTex = (aTex*aTextureTransform.xy) + aTextureTransform.zw;
    vColorScale = aColorScale;

    mat2 trans = mat2(aInstanceWorld.xyzw);
    vec4 localPos = vec4((aPos.xy + aOffset)  * trans, aPos.z, 1);

    localPos +=vec4(aTranslate, 0);
    vec4 pos =  uProj * localPos;
    gl_Position =  pos;
    depth = vec3((pos.z + 1.0) *.5);
}
`;

//
// Fragment shader program
//
const fsSource = `
varying mediump vec2 vTex;
varying mediump  vec3 depth;
uniform sampler2D uSampler;
varying mediump vec4 vColorScale;

void main() {
  mediump vec4 color = texture2D(uSampler, vTex);
    if(color.a < .001) {
      discard;
    } 

    // uncomment to show depth
    //gl_FragColor = vec4(depth.xyz, 1.0);
    gl_FragColor = color * vColorScale;
  
}
`;

/**
 * Shader for sprites
 */
export class SpriteInstanceShader {
  private _shader: ShaderController;

  private _aPos: number;
  private _aTex: number;
  private _aInstanceWorld: number;
  private _uSampler: number;
  private _texture: Texture;
  private _uProj: number;

  constructor(private gl: WebGL2RenderingContext, shaderId: string) {
    this._shader = new ShaderController(this.gl, shaderId);
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._aPos = this._shader.getAttribute('aPos');
    this._aTex = this._shader.getAttribute('aTex');
    this._uSampler = this._shader.getUniform('uSampler');
    this._uProj = this._shader.getUniform('uProj');
  }

  setProj(proj: mat4) {
    this._shader.setMat4(this._uProj, proj);
  }

  setSpriteSheet(texture: Texture) {
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
