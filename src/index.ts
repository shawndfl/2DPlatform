
import './css/canvas.css';
import { PlatformEngine } from './_game/PlatformEngine';

/**
   * Create the only instance of a canvas controller
   */
  const engine = new PlatformEngine();

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

