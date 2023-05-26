import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

/**
 * Vertex shader for Font
 */
const FontVS = `
    attribute vec3 aPos;
    attribute vec2 aTex;

    varying mediump vec2 vTex;
                                                
    void main() {
        vTex = aTex;
        gl_Position = vec4(aPos.xyz, 1.0);
    }                          
`;

/**
 * Fragment shader for Font
 */
const FontFS = ` 
      varying mediump vec2 vTex;

      uniform sampler2D uFont;
      uniform mediump vec4 uColor;
                            
      void main() {
        mediump vec4 color = texture2D(uFont, vTex) * uColor;
        if(color.w > 0.2) { 
          gl_FragColor = texture2D(uFont, vTex) * uColor;
        } else {
          discard;
        }
      }
`;

export class BattleScreenWipe extends Component {
  constructor(eng: Engine) {
    super(eng);
  }
}
