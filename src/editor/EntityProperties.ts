import '../css/EntityProperties.css';

export class EntityProperties {
  container: HTMLElement;

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('editor-entity-properties');
    this.container.innerHTML = 'properties';
    return this.container;
  }
}
