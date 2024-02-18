import { Component } from '../components/Component';
import { clamp } from '../math/constants';
import { Engine } from './Engine';
import REACT from 'jsx-dom';
import '../css/canvas.scss';

/**
 * This controller manages the canvas
 */
export class CanvasController extends Component {
  private _glContext: WebGL2RenderingContext;
  private _container: HTMLElement;
  private readonly defaultAspectRatio = 1.33333;
  private errorHtml: HTMLElement;
  private _canvas: HTMLCanvasElement;

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get gl(): WebGL2RenderingContext {
    return this._glContext;
  }

  constructor(eng: Engine) {
    super(eng);
    this._container = (<div class='canvas-container'></div>) as HTMLElement;

    // add canvas
    this._canvas = document.createElement('canvas');
    this._canvas.width = 800;
    this._canvas.height = 600;
    this._canvas.classList.add('canvas');
    this._container.append(this._canvas);

    // add an error screen
    this.errorHtml = (
      <div class='game-error game-hidden'>Width too small, try landscape</div>
    ) as HTMLElement;
    this._container.append(this.errorHtml);

    window.addEventListener('resize', (e) => {
      const w = clamp(window.screen.width, 800, 1920);
      const h = window.screen.height;
      //this._canvas.width = w;
      //this._canvas.height = w * 0.75;
      /*
      if (window.screen.width < 800) {
        this.errorHtml.classList.remove('game-hidden');
        this._canvas.classList.add('game-hidden');
      } else {
        this.errorHtml.classList.add('game-hidden');
        this._canvas.classList.remove('game-hidden');
      }
*/
      this.eng.resize(this._canvas.width, this._canvas.height);
    });

    if (this.eng.urlParams.get('debug')) {
      /** @type {WebGL2RenderingContext} render context from this canvas*/
      // @ts-ignore
      this._glContext = (WebGLDebugUtils as any).makeDebugContext(
        this._canvas.getContext('webgl2'),
        this.logGlError.bind(this),
        this.logGLCall.bind(this)
      );
    } else {
      this._glContext = this._canvas.getContext('webgl2');
      if (!this._glContext) {
        this.errorHtml.classList.remove('game-hidden');
        this.errorHtml.innerHTML = 'webgl2 not supported!';
        this._canvas.classList.add('game-hidden');
      }
    }
    // Only continue if WebGL is available and working
    if (this.gl === null) {
      console.error(
        'Unable to initialize WebGL2. Your browser or machine may not support it.'
      );
      return;
    }
  }

  initialize(rootElement: HTMLElement) {
    rootElement.append(this._container);
  }

  logGlError(error: string, functionName: string, args: any) {
    const errorString =
      'GL error: ' +
      error +
      ' in gl.' +
      functionName +
      '(' +
      // @ts-ignore
      (WebGLDebugUtils as any).glFunctionArgsToString(functionName, args) +
      ')';
    this.error(errorString);
  }

  error(e: string): void {
    this.errorHtml.classList.remove('game-hidden');
    this.errorHtml.innerHTML += e + '<br>';
    this._canvas.classList.add('game-hidden');

    console.error(e);
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
