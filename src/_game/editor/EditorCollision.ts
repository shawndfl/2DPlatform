import rect from '../../math/rect';
import { ICollision } from '../data/ILevelData';
import { EditorComponent } from './EditorComponent';
import { GameEditor } from './GameEditor';

export class EditorCollision extends EditorComponent {
  get id(): string {
    return this._collision.id;
  }

  get type(): string {
    return this._collision.type;
  }

  get meta(): Map<string, string> {
    return this._collision.meta;
  }

  constructor(protected _collision: ICollision, editor: GameEditor) {
    super(editor);
  }

  draw(context: CanvasRenderingContext2D): void {
    const box = this._collision.box;
    context.fillStyle = '#ff0000';
    const height = this.editor.editorCanvas.canvas.height;
    context.fillRect(box.left, height - box.top, box.width, box.height);
  }
}
