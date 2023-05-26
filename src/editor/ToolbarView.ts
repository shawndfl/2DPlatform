import '../css/ToolbarView.css';

export class ToolbarView {
  container: HTMLElement;

  constructor() {}

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('editor-toolbar');

    return this.container;
  }

  addButton(id: string, icon: string, text: string, click: () => void) {
    const btn = document.createElement('button');
    btn.dataset.id = id;
    btn.classList.add('btn');
    btn.addEventListener('click', () => {
      if (click) {
        click();
      }
    });

    const span = document.createElement('span');

    const img = document.createElement('img');
    img.src = icon;

    const textDiv = document.createElement('div');
    textDiv.innerHTML = text;

    span.append(img, textDiv);
    btn.append(span);
    this.container.append(btn);
  }
}
