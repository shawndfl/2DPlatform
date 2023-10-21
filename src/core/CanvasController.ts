import { Component } from './Component';
import { Engine } from './Engine';
/**
 * This controller manages the canvas
 */
export class CanvasController extends Component {
  private _glContext: WebGL2RenderingContext;
  private _container: HTMLElement;

  get gl() {
    return this._glContext;
  }

  constructor(eng: Engine) {
    super(eng);
    this._container = document.createElement('div');
    this._container.classList.add('canvas-container');

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.classList.add('canvas');

    this._container.append(canvas);

    window.addEventListener('resize', (e) => {
      this.eng.resize(canvas.width, canvas.height);
    });

    if (true) {
      /** @type {WebGL2RenderingContext} render context from this canvas*/
      // @ts-ignore
      this._glContext = (WebGLDebugUtils as any).makeDebugContext(
        canvas.getContext('webgl2'),
        this.logGlError.bind(this),
        this.logGLCall.bind(this)
      );
    } else {
      this._glContext = canvas.getContext('webgl2');
    }
    // Only continue if WebGL is available and working
    if (this.gl === null) {
      console.error('Unable to initialize WebGL2. Your browser or machine may not support it.');
      return;
    }
  }

  initialize(rootElement: HTMLElement) {
    rootElement.append(this._container);
  }

  logGlError(error: string, functionName: string, args: any) {
    console.error(
      'GL error: ' +
      error +
      ' in gl.' +
      functionName +
      '(' +
      // @ts-ignore
      (WebGLDebugUtils as any).glFunctionArgsToString(functionName, args) +
      ')'
    );
  }

  logGLCall(functionName: string, args: any) {
    /*
    console.log(
      'gl.' +
        functionName +
        '(' +
        // @ts-ignore
        (WebGLDebugUtils as any).glFunctionArgsToString(functionName, args) +
        ')'
    );
    */
  }
}
