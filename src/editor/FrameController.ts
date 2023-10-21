import { AnimationEditor } from "./AnimationEditor";
import { EditorComponent } from "./EditorComponent";
import '../css/editor.scss'
import { ResourceLoader } from "../utilities/LoadRemote";

/**
 * Manages a control that holds all the frames
 */
export class FrameController extends EditorComponent {

    container: HTMLElement;
    list: HTMLElement;

    constructor(editor: AnimationEditor) {
        super(editor);
    }

    async initialize() {
        this.container = document.createElement('div');
        this.container.classList.add('frames');
        this.editor.root.append(this.container);

        this.list = document.createElement('div');
        this.list.classList.add('list');
        this.container.append(this.list);
        const data = ResourceLoader.loadFile('./data/');
        console.debug('response ', data);
        const item = document.createElement('div');
        item.classList.add('item');
        item.id = 'item1'
        item.innerHTML = 'test';
        item.addEventListener('dragstart', (e) => {
            const target = e.target as HTMLElement;
            e.dataTransfer.setData("text/plain", target.id);
        })
        item.addEventListener('dragover', (e) => {

        })

        this.list.append(item);


    }

    update(dt: number) {

    }
}