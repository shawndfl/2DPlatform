
import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';
import { BaseShader } from './BaseShader';

//
// Vertex Shader program
//
const vsSource = `
attribute vec3 aPos;
attribute vec4 aColor;
uniform mat4 uProj;
uniform mat4 uWorld;
varying mediump vec4 vColor;

void main() {
    vColor = aColor;
    //vec4 pos = uWorld * uProj * vec4(aPos.xyz, 1.0);
    vec4 pos = vec4(aPos.xyz, 1.0);
    gl_Position =  pos;
}
`;

//
// Fragment shader program
//
const fsSource = `
varying mediump vec4 vColor;

void main() {
    if(vColor.a < .001) {
      discard;
    } 

    // uncomment to show depth
    gl_FragColor = vColor;
  
}
`;

/**
 * Shader for sprites
 */
export class SkinMesh2DShader extends BaseShader {

    private _aPos: number;
    private _aColor: number;
    private _uProj: number;

    constructor(gl: WebGL2RenderingContext, shaderId: string) {
        super(gl, shaderId);

        this.initShaderProgram(vsSource, fsSource);

        this.enable();

        // set the info
        this._aPos = this.getAttribute('aPos');
        this._aColor = this.getAttribute('aColor');
        //this._uProj = this.getUniform('uProj');
    }

    setProj(proj: mat4) {
        this.setMat4(this._uProj, proj);
    }

    enable() {
        // place holder in case we add textures
        super.enable();
    }

    protected bindAttributes(program: WebGLProgram): void {
        this.gl.bindAttribLocation(program, 0, 'aPos');
        this.gl.bindAttribLocation(program, 1, 'aColor');
    }

}
