import { GameEditor } from './GameEditor';

/**
 * base class that has access to an editor
 */
export class EditorComponent {
  get editor(): GameEditor {
    return this._editor;
  }

  constructor(private readonly _editor: GameEditor) {}
}
