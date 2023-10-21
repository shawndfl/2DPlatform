
import './css/canvas.scss';
import { PlatformEngine } from './_game/PlatformEngine';

/**
 * Create the only instance of a canvas controller
 */
const engine = new PlatformEngine();

/**
 * Start the engine then request and animation frame
 */
engine
  .initialize(document.getElementById('rootContainer'))
  .then(() => {
    /** time tracking variables */
    let previousTimeStamp: number;

    // request the first frame
    window.requestAnimationFrame((t) => {

      function step(timestamp: number) {

        window.requestAnimationFrame(step);

        // save the start time
        if (previousTimeStamp === undefined) {
          previousTimeStamp = timestamp;
        }

        // calculate the elapsed
        const elapsed = timestamp - previousTimeStamp;

        // update the scene
        engine.update(elapsed);

        // request a new frame
        previousTimeStamp = timestamp;
      }
      step(t);
    });
  })
  .catch((e) => {
    console.error('Error initializing ', e);
  });
