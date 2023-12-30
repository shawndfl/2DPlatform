import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

//
// Vertex Shader program
//
const vsSource = `
attribute vec3 aPos;
attribute vec2 aTex;
uniform vec4 uColorScale;
uniform mat4 uWorld;
uniform mat4 uProj;
uniform vec2 uOffset;
varying mediump vec2 vTex;
varying mediump vec4 vColorScale;
varying mediump vec3 depth;

void main() {
    vTex = (aTex);
    vColorScale = uColorScale;

    vec4 pos = uProj * uWorld * vec4(aPos.xy + uOffset, aPos.z, 1.0);
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
    
  // uncomment to show depth
  //gl_FragColor = vec4(1,1,1, 1.0);
  gl_FragColor = color * vColorScale;
  
}
`;

/**
 * Shader for sprites
 */
export class SpriteShader {
  private _shader: ShaderController;

  private _aPos: number;
  private _aTex: number;
  private _uOffset: number;
  private _uWorld: number;
  private _uColorScale: number;
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
    this._uWorld = this._shader.getUniform('uWorld');
    this._uOffset = this._shader.getUniform('uOffset');
    this._uColorScale = this._shader.getUniform('uColorScale');
  }

  setProj(proj: mat4) {
    this._shader.setMat4(this._uProj, proj);
  }

  setWorld(world: mat4) {
    this._shader.setMat4(this._uWorld, world);
  }

  setOffset(offset: vec2) {
    this._shader.setVec2(this._uOffset, offset);
  }

  setColorScale(color: vec4) {
    this._shader.setVec4(this._uColorScale, color);
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
