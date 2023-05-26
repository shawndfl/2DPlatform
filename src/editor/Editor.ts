import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { EntityBrowser } from './EntityBrowser';
import { ToolbarView } from './ToolbarView';
import '../css/Editor.scss';
import { EntityProperties } from './EntityProperties';
import File from '../assets/editor/file.svg';
import { EditorCanvas } from './EditorCanvas';

export class Editor {
  private _parent: HTMLElement;
  private _toolbarView: ToolbarView;
  private _entityBrowser: EntityBrowser;
  private _entityProperties: EntityProperties;
  private _editorCanvas: EditorCanvas;

  constructor() {
    this._toolbarView = new ToolbarView();
    this._entityBrowser = new EntityBrowser();
    this._entityProperties = new EntityProperties();
    this._editorCanvas = new EditorCanvas();
  }

  async initialize(parentContainer: HTMLElement) {
    this._parent = parentContainer;
    this.buildHtml();
    this.buildToolbar();
    this._editorCanvas.render();
  }

  update(dt: number) {
    this._editorCanvas.render();
  }

  buildHtml() {
    const main = document.createElement('div');
    main.classList.add('editor-main');

    this._parent.append(this._toolbarView.buildHtml());

    const entityContainer = document.createElement('div');
    entityContainer.classList.add('editor-entity-container');
    entityContainer.append(this._entityBrowser.buildHtml(), this._entityProperties.buildHtml());

    let lastX = 0;
    let mouseDown = false;

    // add resizable bar
    const resizable = document.createElement('div');
    window.addEventListener('mousemove', (e) => {
      if (mouseDown) {
        const dx = e.x - lastX;
        lastX = e.x;
        const width = parseInt(getComputedStyle(entityContainer, '').width);
        entityContainer.style.width = width + dx + 'px';
        e.preventDefault();
      }
    });
    window.addEventListener('mouseup', (e) => {
      mouseDown = false;
    });
    resizable.addEventListener('mousedown', (e) => {
      if (e.buttons === 1) {
        mouseDown = true;
        lastX = e.x;
      }
    });
    resizable.addEventListener('mouseup', (e) => {
      mouseDown = false;
    });

    resizable.classList.add('editor-h-resize');

    main.append(entityContainer, resizable, this._editorCanvas.buildHtml());

    this._parent.append(main);
  }

  buildToolbar() {
    this._toolbarView.addButton('new', File, 'New Scene', () => {
      console.debug('new scene!!');
    });
  }
}
