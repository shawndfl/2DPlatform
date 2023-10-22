
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { TextManager } from '../systems/TextManager';
import { Component } from '../components/Component';
import { Engine } from './Engine';

/**
 * Shows the FPS
 */
export class FpsController extends Component {
  fps: number;
  frames: number;
  seconds: number;
  delayCounter: number;
  displayInterval: number;

  constructor(eng: Engine) {
    super(eng);

    /** The frames per second (float) */
    this.fps = 0;
    this.frames = 0;
    this.seconds = 0;
    /** Just a counter for displaying FPS to the console */
    this.delayCounter = 0;
    /** Show the FPS every second */
    this.displayInterval = 1000;
  }

  /**
   * Calculate the FPS
   * @param {float} dt delta time in ms
   */
  update(dt: number) {
    this.delayCounter += dt;
    this.seconds += dt / 1000;
    this.frames++;

    if (this.delayCounter >= this.displayInterval) {
      this.fps = this.frames / this.seconds;
      this.frames = 0;
      this.seconds = 0;
      //console.debug('ms ' + dt.toFixed(2) + ' FPS: ' + this.fps.toFixed(2));
      this.eng.textManager.setTextBlock({
        id: 'FPS',
        text: 'FPS: ' + this.fps.toFixed(2) + ' dt ' + dt.toFixed(2),
        position: new vec2([450, 580]),
        color: new vec4([0.9, 0.5, 0.8, 1.0]),
        depth: -1,
        scale: 0.8,
      });

      this.delayCounter = 0;
    }
  }
}
