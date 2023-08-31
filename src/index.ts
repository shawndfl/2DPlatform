
import './css/canvas.css';
import { PlatformEngine } from './_game/PlatformEngine';
import { AnimationEditor } from './editor/AnimationEditor';

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString);

if (urlParams.get('animation')) {
  const animation = new AnimationEditor();
  animation.initialize(document.getElementById('rootContainer'));

} else {

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
          window.requestAnimationFrame(step);
        }
        step(t);
      });
    })
    .catch((e) => {
      console.error('Error initializing ', e);
    });

}