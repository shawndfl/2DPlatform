import { Component } from '../../components/Component';
import { Engine } from '../../core/Engine';
import REACT from 'jsx-dom';
import { EditorComponent } from './EditorComponent';
import { GameEditor } from './GameEditor';

/**
 * Item in the entity list
 */
export class EditorEntityItem extends EditorComponent {
  container: HTMLElement;
  protected _onClick: () => void;

  public get name(): string {
    return this._name;
  }

  public get image(): HTMLImageElement {
    return this._image;
  }

  constructor(
    private _name: string,
    private _image: HTMLImageElement,
    private _color: string,
    editor: GameEditor
  ) {
    super(editor);
    this.image;
    this.buildView();
  }

  buildView(): EditorEntityItem {
    this.container = (
      <div class='item'>
        <div class='color' style={{ backgroundColor: this._color }}>
          &nbsp;
        </div>
        <div class='title'>{this.name}</div>
        {this.image}
      </div>
    ) as any as HTMLElement;
    return this;
  }

  onClick(onClick: () => void): EditorEntityItem {
    this._onClick = onClick.bind(this);
    this.container.addEventListener('click', this._onClick);
    return this;
  }
}
