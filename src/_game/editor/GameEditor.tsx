
import { Component } from "../../core/Component";
import { PlatformEngine } from "../PlatformEngine";
import { EditorTabs } from './EditorTabs';

import REACT from 'jsx-dom'

export class GameEditor extends Component {

    private tabs: EditorTabs;
    constructor(eng: PlatformEngine) {
        super(eng);
    }

    async initialize(root: HTMLElement): Promise<void> {
        this.tabs = new EditorTabs(this.eng);
        this.tabs.buildView(root);
    }

    update(dt: number) {

    }

}