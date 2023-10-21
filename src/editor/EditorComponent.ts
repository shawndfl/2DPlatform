import { AnimationEditor } from "./AnimationEditor";

export class EditorComponent {

    get editor(): AnimationEditor {
        return this._editor
    }

    constructor(private _editor: AnimationEditor) {

    }
}