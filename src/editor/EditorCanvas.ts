import '../css/EditorCanvas.scss';
import vec2 from '../math/vec2';
import { CanvasRenderer } from './CanvasRenderer';

export class EditorCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  canvasRenderer: CanvasRenderer;
  scaleStep: number;
  isPanning: boolean;
  lastPos: vec2;

  buildHtml(): HTMLCanvasElement {
    this.canvasRenderer = new CanvasRenderer();
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('editor-canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.isPanning = false;

    this.scaleStep = 20;

    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.mouseDown(e);
    });
    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      this.mouseUp(e);
    });
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouseMove(e);
    });
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      this.mouseWheel(e);
    });

    return this.canvas;
  }

  mouseDown(e: MouseEvent) {
    console.debug('down', e);
  }
  mouseUp(e: MouseEvent) {
    console.debug('up', e);
    this.lastPos = undefined;
  }
  mouseWheel(e: WheelEvent) {
    const scale = this.canvasRenderer.scale + 2.0 / (e.deltaY > 0 ? -this.scaleStep : this.scaleStep);
    this.canvasRenderer.setScale(scale);
  }
  mouseMove(e: MouseEvent) {
    // right click
    if (e.ctrlKey && e.buttons == 1) {
      const scale = 0.5;
      if (!this.lastPos) {
        this.lastPos = new vec2(e.offsetX, e.offsetY);
      }
      const delta = new vec2(e.offsetX, e.offsetY).subtract(this.lastPos);
      const offset = this.canvasRenderer.offset.add(delta.scale(scale));
      console.debug('delta ' + delta + ' offset ' + offset);
      this.canvasRenderer.setOffset(offset);
      this.lastPos.x = e.offsetX;
      this.lastPos.y = e.offsetY;
    }
  }

  render() {
    this.canvasRenderer.render(this.context);
  }
}
