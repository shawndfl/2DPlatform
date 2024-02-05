import { Component } from '../../components/Component';
import { PlatformEngine } from '../PlatformEngine';
import { EditorTabs } from './EditorTabs';
import { EditorCanvas } from './EditorCanvas';
import '../../css/editor.scss';

import REACT from 'jsx-dom';

export class GameEditor extends Component {
  private ready: boolean;
  private canvas: EditorCanvas;

  private tabs: EditorTabs;
  constructor(eng: PlatformEngine) {
    super(eng);
    this.canvas = new EditorCanvas();
  }

  async initialize(root: HTMLElement): Promise<void> {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const hasEditor = urlParams.get('editor');
    if (!hasEditor) {
      return;
    }

    this.tabs = new EditorTabs(this.eng);
    this.tabs.buildView(root);

    await this.canvas.initialize();
    root.append(this.canvas.element);

    this.ready = true;
  }

  update(dt: number) {
    if (this.ready) {
    }
  }
}
