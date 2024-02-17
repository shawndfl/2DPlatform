import REACT from 'jsx-dom';
import { EditorCollision } from './EditorCollision';
import { EditorComponent } from './EditorComponent';
import { ICollision, ILevelData, LevelData } from '../data/ILevelData';

export class EditorCanvas extends EditorComponent {
  private _canvas: HTMLCanvasElement;
  container: HTMLElement;
  context: CanvasRenderingContext2D;
  collisions: Map<string, EditorCollision> = new Map<string, EditorCollision>();
  levelData: LevelData;

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  async initialize(): Promise<void> {
    this.container = (<div class='editor-canvas'></div>) as HTMLElement;
    this._canvas = document.createElement('canvas');
    this._canvas.width = 800;
    this._canvas.height = 600;
    this.context = this._canvas.getContext('2d');
    this._canvas.classList.add('editor-canvas', 'canvas');
    this.container.append(this._canvas);
    this.canvas.addEventListener('mousemove', (e) => {
      console.debug('click ', e);
    });
  }

  loadLevel(data: ILevelData) {
    this.levelData = new LevelData(data);
    this.collisions.clear();

    this.levelData.collision.forEach((c) => {
      this.createCollision(c);
    });

    this.draw();
  }

  createCollision(collision: ICollision): EditorCollision {
    const editorCollision = new EditorCollision(collision, this.editor);
    this.collisions.set(collision.id, editorCollision);
    return editorCollision;
  }

  draw(): void {
    this.context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.collisions.forEach((c) => {
      c.draw(this.context);
    });
  }

  saveLevel(): void {}
}
