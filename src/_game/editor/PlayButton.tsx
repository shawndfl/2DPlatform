import { Component } from 'react';
import { EditorComponent } from './EditorComponent';

export class PlayButton extends EditorComponent {
  private _container: HTMLElement;

  createHtml(): HTMLElement {
    this._container = (
      <div class='play-button-container'>
        <button class='prim-button'>Play</button>
      </div>
    ) as HTMLElement;

    this._container.firstChild.addEventListener('click', () => {
      this.editor.playToggle();
    });
    return this._container;
  }

  togglePlay(isPlaying: boolean): void {
    if (isPlaying) {
      (this._container.firstChild as HTMLButtonElement).innerHTML = 'Play';
    } else {
      (this._container.firstChild as HTMLButtonElement).innerHTML = 'Pause';
    }
  }
}
