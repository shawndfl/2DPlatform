
import { Component } from '../../components/Component'
import { Engine } from '../../core/Engine';
import REACT from 'jsx-dom'

export class EditorTabs extends Component {
    constructor(eng: Engine) {
        super(eng);
    }

    buildView(parent: HTMLElement) {
        const panel = <div class='editor-tabs'>Tabs</div> as HTMLElement;
        parent.append(panel);
    }
}