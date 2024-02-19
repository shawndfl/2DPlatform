import './css/canvas.scss';
import { PlatformEngine } from './_game/PlatformEngine';
import { GameEditor } from './_game/editor/GameEditor';

/**
 * Create the only instance of a canvas controller
 */
const engine = new PlatformEngine();
const editor = new GameEditor(engine);

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

  // if the frame tool longer than 20ms through it out
  if (elapsed < 50) {
    // update the scene
    engine.update(elapsed);
    // update the editor
    editor.update(elapsed);
  }
  // request a new frame
  previousTimeStamp = timestamp;
}

/**
 * Start the engine then request and animation frame
 */
engine
  .initialize(document.getElementById('game-container'))
  .then(() => {
    // initialize the editor
    editor
      .initialize(document.getElementById('editor-container'))
      // then request the first animation frame
      .then(() => window.requestAnimationFrame(step));
  })
  .catch((e) => {
    console.error('Error initializing ', e);
  });
