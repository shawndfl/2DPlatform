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
  private canvas: HTMLCanvasElement;

  get gl(): WebGL2RenderingContext {
    return this._glContext;
  }

  constructor(eng: Engine) {
    super(eng);
    this._container = (<div class='canvas-container'></div>) as HTMLElement;

    // add canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.classList.add('canvas');
    this._container.append(this.canvas);

    // add an error screen
    this.errorHtml = (
      <div class='game-error game-hidden'>Width too small, try landscape</div>
    ) as HTMLElement;
    this._container.append(this.errorHtml);

    window.addEventListener('resize', (e) => {
      const w = clamp(window.screen.width, 800, 1920);
      const h = window.screen.height;
      //this.canvas.width = w;
      //this.canvas.height = w * 0.75;
      /*
      if (window.screen.width < 800) {
        this.errorHtml.classList.remove('game-hidden');
        this.canvas.classList.add('game-hidden');
      } else {
        this.errorHtml.classList.add('game-hidden');
        this.canvas.classList.remove('game-hidden');
      }
*/
      this.eng.resize(this.canvas.width, this.canvas.height);
    });

    if (this.eng.urlParams.get('debug')) {
      /** @type {WebGL2RenderingContext} render context from this canvas*/
      // @ts-ignore
      this._glContext = (WebGLDebugUtils as any).makeDebugContext(
        this.canvas.getContext('webgl2'),
        this.logGlError.bind(this),
        this.logGLCall.bind(this)
      );
    } else {
      this._glContext = this.canvas.getContext('webgl2');
      if (!this._glContext) {
        this.errorHtml.classList.remove('game-hidden');
        this.errorHtml.innerHTML = 'webgl2 not supported!';
        this.canvas.classList.add('game-hidden');
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
    this.errorHtml.classList.remove('game-hidden');
    this.errorHtml.innerHTML += errorString + '<br>';
    this.canvas.classList.add('game-hidden');

    console.error(errorString);
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
