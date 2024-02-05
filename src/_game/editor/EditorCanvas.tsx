import REACT from 'jsx-dom';

export class EditorCanvas {
  element: HTMLCanvasElement;

  async initialize(): Promise<void> {
    this.element = document.createElement('canvas');
    this.element.classList.add('editor-canvas');
  }
}
