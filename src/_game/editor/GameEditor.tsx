import { Component } from '../../components/Component';
import { PlatformEngine } from '../PlatformEngine';
import { EditorEntityList } from './EditorEntityList';
import { EditorCanvas } from './EditorCanvas';
import '../../css/editor.scss';
import Level2Data from '../assets/level2/level2.json';

import REACT from 'jsx-dom';

export class GameEditor extends Component {
  private _ready: boolean;
  private _canvas: EditorCanvas;
  private urlParams: URLSearchParams;
  private _isActive: boolean;
  private entityList: EditorEntityList;

  public get editorCanvas(): EditorCanvas {
    return this._canvas;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this._canvas = new EditorCanvas(this);

    const queryString = window.location.search;
    this.urlParams = new URLSearchParams(queryString);
    this._isActive = !!this.urlParams.get('editor');
  }

  async initialize(root: HTMLElement): Promise<void> {
    if (!this._isActive) {
      return;
    }

    root.classList.remove('game-hidden');
    this.entityList = new EditorEntityList(this);
    this.entityList.buildView(root);

    this.entityList.addItem('solid', '#ff0000', null).onClick(() => {
      console.debug('adding solid');
    });
    this.entityList.addItem('elevator', '#00ff00', null).onClick(() => {
      console.debug('adding elevator');
    });
    this.entityList.addItem('enemy', '#457398', null).onClick(() => {
      console.debug('adding enemy');
    });

    await this._canvas.initialize();
    this._canvas.loadLevel(Level2Data);
    root.append(this._canvas.container);

    this._ready = true;
  }

  onGameInitialized(): void {}

  update(dt: number) {
    if (this._ready) {
    }
  }
}
