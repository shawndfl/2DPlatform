import { PlatformEngine } from '../PlatformEngine';
import { EditorEntityList } from './EditorEntityList';
import { EditorCanvas } from './EditorCanvas';
import { PlayButton } from './PlayButton';
import '../../css/editor.scss';

import REACT from 'jsx-dom';
import { LevelData } from '../data/ILevelData';
import { GameComponent } from '../components/GameComponent';

export class GameEditor extends GameComponent {
  private _ready: boolean;
  private _canvas: EditorCanvas;
  private urlParams: URLSearchParams;
  private _isActive: boolean;
  private entityList: EditorEntityList;
  private playButton: PlayButton;
  private _isPlaying: boolean;

  public get editorCanvas(): EditorCanvas {
    return this._canvas;
  }

  constructor(eng: PlatformEngine) {
    super(eng);
    this._canvas = new EditorCanvas(this);
    this.playButton = new PlayButton(this);

    const queryString = window.location.search;
    this.urlParams = new URLSearchParams(queryString);
    this._isActive = !!this.urlParams.get('editor');
  }

  async initialize(root: HTMLElement): Promise<void> {
    if (!this._isActive) {
      return;
    }

    // if the editor is active the eng must not be
    this.eng.isActive = this._isPlaying;

    root.classList.remove('game-hidden');
    this.entityList = new EditorEntityList(this);
    this.entityList.buildView(root);

    this.entityList.addItem('New', '#ff0000', null).onClick(() => {
      this.newLevel();
    });
    this.entityList.addItem('Save', '#00ff00', null).onClick(() => {
      this.saveLevel();
    });

    await this._canvas.initialize();
    this._canvas.loadLevel(this.eng.sceneManager.sceneData);
    root.append(this._canvas.container, this.playButton.createHtml());

    this._ready = true;
  }
  /**
   * toggling play button. This will hide the editor
   * except for the play/pause button. This will also
   * active the
   */
  playToggle(): void {
    this._isPlaying = !this._isPlaying;
    this._canvas.show(!this._isPlaying);
    this.entityList.show(!this._isPlaying);
    this.playButton.togglePlay(this._isPlaying);

    // enable the game
    this.eng.isActive = this._isPlaying;
    this.saveLevel();
    this.eng.sceneManager.loadStorageLevel();
  }

  saveLevel(): void {
    this._canvas.saveLevel();
  }

  newLevel(): void {
    this._canvas.newLevel();
  }

  update(dt: number) {
    if (!this._isActive) {
      return;
    }

    if (this._ready) {
      //editor update loop
    }
  }
}
