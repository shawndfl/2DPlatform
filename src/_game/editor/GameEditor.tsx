
import { Component } from "../../core/Component";
import { PlatformEngine } from "../PlatformEngine";
import REACT from 'jsx-dom'

export class GameEditor extends Component {

    constructor(eng: PlatformEngine) {
        super(eng);
    }

    async initialize(root: HTMLElement): Promise<void> {
        root.append(<div>Testing </div> as HTMLElement);
    }

    update(dt: number) {

    }

}