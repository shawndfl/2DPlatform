import { CanvasController } from './core/CanvasController';
import { Engine } from './core/Engine';
import './css/canvas.css';
import { Editor } from './editor/Editor';

// check if we should be in editor mode or just run the game
const url = new URL(window.location.href);
if (url.searchParams.get('editor')) {
  const editor = new Editor();

  /** time tracking variables */
  let previousTimeStamp: number;

  function step(timestamp: number) {
    // save the start time
    if (previousTimeStamp === undefined) {
      previousTimeStamp = timestamp;
    }

    // calculate the elapsed
    const elapsed = timestamp - previousTimeStamp;

    // update the scene
    editor.update(elapsed);

    // request a new frame
    previousTimeStamp = timestamp;
    window.requestAnimationFrame(step);
  }

  editor
    .initialize(document.getElementById('rootContainer'))
    .then(() => {
      // request the first frame
      window.requestAnimationFrame(step);
    })
    .catch((e) => {
      console.error('Error initializing ', e);
    });
} else {
  /**
   * Create the only instance of a canvas controller
   */
  const engine = new Engine();

  /** time tracking variables */
  let previousTimeStamp: number;

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
}
