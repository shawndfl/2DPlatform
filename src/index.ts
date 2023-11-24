
import './css/canvas.scss';
import { PlatformEngine } from './_game/PlatformEngine';
import { clamp } from './math/constants';

/**
 * Create the only instance of a canvas controller
 */
const engine = new PlatformEngine();
/** time tracking variables */
let previousTimeStamp: number;

function step(timestamp: number) {
  window.requestAnimationFrame(step);

  // save the start time
  if (previousTimeStamp === undefined) {
    previousTimeStamp = timestamp;
  }

  // calculate the elapsed
  const elapsed = timestamp - previousTimeStamp;

  // if the frame tool longer than 100ms through it out
  if (elapsed < 100) {
    // update the scene
    engine.update(elapsed);

  }
  // request a new frame
  previousTimeStamp = timestamp;

}

/**
 * Start the engine then request and animation frame
 */
engine
  .initialize(document.getElementById('rootContainer'))
  .then(() => {
    // request the first frame
    window.requestAnimationFrame(step);
  })
  .catch((e) => {
    console.error('Error initializing ', e);
  });

