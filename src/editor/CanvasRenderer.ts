import rect from '../math/rect';
import vec2 from '../math/vec2';
import * as MathConst from '../math/constants';

/**
 * Render to the canvas editor
 */
export class CanvasRenderer {
  ctx: CanvasRenderingContext2D;
  maxScale: number;
  minScale: number;
  scale: number;
  private _offset: vec2;
  offsetBounds: rect;
  private dirty: boolean;

  get offset() {
    return this._offset.copy();
  }

  constructor() {
    this.offsetBounds = new rect([-200, 4000, -2000, 4000]);
    this.scale = 1.5;
    this.minScale = 0.3;
    this.maxScale = 4;
    this._offset = new vec2(400, 300); // 600, 450
    this.dirty = true;
  }

  render(context: CanvasRenderingContext2D) {
    if (this.dirty) {
      this.ctx = context;
      this.ctx.lineWidth = 1;

      // reset transform
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Use the identity matrix while clearing the canvas
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      this.renderGrid();
    }

    this.dirty = false;
  }

  setScale(value: number) {
    const currentScale = this.scale;
    this.scale = MathConst.clamp(value, this.minScale, this.maxScale);
    const scaleDelta = this.scale - currentScale;
    const offset = new vec2(this.ctx.canvas.width, this.ctx.canvas.height).scale(scaleDelta);
    const newOffset = this.offset.add(offset);
    console.debug(
      'scale ' +
        this.scale.toFixed(4) +
        ' delta scale ' +
        scaleDelta.toFixed(4) +
        ' old offset ' +
        this.offset +
        ' scale offset ' +
        offset +
        ' new offset ' +
        newOffset
    );
    this.setOffset(newOffset);
    this.dirty = true;
  }

  setOffset(value: vec2) {
    this._offset.x = MathConst.clamp(value.x, this.offsetBounds.left, this.offsetBounds.right);
    this._offset.y = MathConst.clamp(value.y, this.offsetBounds.top, this.offsetBounds.bottom);
    console.debug('clamp offset ' + this._offset);
    this.dirty = true;
  }

  private renderGrid() {
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.beginPath();

    const stepX = 16;
    const stepY = 16;

    this.ctx.fillStyle = '#000000';
    const maxI = 50;
    const maxJ = 50;
    for (let i = 0; i < maxI; i++) {
      const x1 = -i * stepX * 2;
      const y1 = i * stepY;
      const x2 = -i * stepX * 2 + (maxJ - 1) * stepX * 2;
      const y2 = (maxJ - 1) * stepX + i * stepY;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    for (let j = 0; j < maxJ; j++) {
      const x1 = j * stepX * 2;
      const y1 = j * stepY;
      const x2 = j * stepX * 2 - (maxI - 1) * stepX * 2;
      const y2 = (maxI - 1) * stepX + j * stepY;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    this.ctx.stroke();
  }
}
