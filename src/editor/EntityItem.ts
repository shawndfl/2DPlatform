import '../css/EntityItem.scss';

export class EntityItem {
  container: HTMLElement;

  buildHtml(name: string, click: (item: EntityItem) => void): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('btn');
    this.container.dataset.name = name;
    this.container.classList.add('entity-item');
    this.container.addEventListener('click', () => {
      if (click) {
        click(this);
      }
    });
    return;
  }
}
