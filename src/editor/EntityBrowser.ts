import '../css/EntityBrowser.css';
export class EntityBrowser {
  container: HTMLElement;

  constructor() {}

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.innerHTML = 'Entity Browser';
    this.container.classList.add('editor-entity-browser');
    return this.container;
  }
}
