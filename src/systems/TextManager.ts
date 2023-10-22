import { TextController } from '../graphics/TextController';
import { IFontData } from '../graphics/IFontData';
import { ITextModel } from '../graphics/ITextModel';
import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import { Engine } from '../core/Engine';
import { Component } from '../components/Component';

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

/**
 * Font manager keeps track of all FontController objects
 */
export class TextManager extends Component {
  texts: Map<string, TextController>;
  fontData: IFontData[];
  private maxHeightOfCharacters: number;
  shader: ShaderController;
  fontTexture: Texture;

  get lineHeight(): number {
    return this.maxHeightOfCharacters;
  }

  shaderInfo: {
    attr: { aPos: number; aTex: number };
    uniform: { uFont: number; uColor: number };
  };

  constructor(eng: Engine) {
    super(eng);
    this.texts = new Map<string, TextController>();
    this.shader = new ShaderController(this.gl, 'fontShader');

    /** Shader info for this shader */
    this.shaderInfo = {
      attr: { aPos: 0, aTex: 0 },
      uniform: { uFont: 0, uColor: 0 },
    };
  }

  /**
   * Initialize the font manage. Only one font can be used per manager
   * The font data is a json structure.
   * @param {} fontImage
   * @param {FontData} fontData
   */
  async initialize(): Promise<void> {
    this.fontData = this.eng.assetManager.font.data;
    this.fontTexture = this.eng.assetManager.font.texture;

    this.shader.initShaderProgram(FontVS, FontFS);
    this.shaderInfo.attr.aPos = this.shader.getAttribute('aPos');
    this.shaderInfo.attr.aTex = this.shader.getAttribute('aTex');
    this.shaderInfo.uniform.uFont = this.shader.getUniform('uFont');
    this.shaderInfo.uniform.uColor = this.shader.getUniform('uColor');

    // find the tallest character. This will be used when calculating new lines
    this.maxHeightOfCharacters = 0;
    this.fontData.forEach((value) => {
      if (value.sizeY > this.maxHeightOfCharacters) {
        this.maxHeightOfCharacters = value.sizeY;
      }
    });

    // reset the text controllers
    this.texts.clear();
  }

  /**
   * Get text size of a given string
   * @param text
   * @returns
   */
  getTextSize(text: string): { width: number; height: number } {
    if (!text || this.maxHeightOfCharacters == 0) {
      return { width: 0, height: 0 };
    }

    let width = 0;
    let offsetX = 0;
    let height = this.maxHeightOfCharacters;
    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      if (ch == '\n') {
        offsetX = 0;
        height += this.maxHeightOfCharacters;
      } else if (ch < ' ' || ch > '~') {
        ch = '?';
      }

      const font = this.fontData.find((value) => value.ch == ch);

      if (!font) {
        console.warn("Don't have data for ch: " + ch);
        continue;
      }

      offsetX += font.advance;
    }

    return { width: offsetX, height };
  }

  /**
   * Updates all the TextureController
   * @param {number} dt Delta time in ms
   */
  update(dt: number) {
    // enable the shader
    this.shader.enable();

    // Bind the texture to texture unit 0
    this.fontTexture.enable(this.shaderInfo.uniform.uFont);

    this.texts.forEach((text) => {
      this.shader.setVec4(this.shaderInfo.uniform.uColor, text.color);
      this.shaderInfo.uniform.uColor;

      text.update(dt);
    });
  }

  /**
   * Hide a text
   * @param id
   */
  hideText(id: string) {
    this.texts.delete(id);
  }

  setTextBlock(textModel: ITextModel) {
    let controller = this.texts.get(textModel.id);

    // create one if needed
    if (!controller) {
      controller = new TextController(this.eng, this.fontData);
      this.texts.set(textModel.id, controller);
    }

    controller.initialize(textModel, this.maxHeightOfCharacters);
  }

  /**
   * clean up everything
   */
  dispose() { }
}
