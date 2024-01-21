import { BackgroundComponent } from '../components/BackgroundComponet';
import { Component } from '../components/Component';

/**
 * Manages different backgrounds and foregrounds in a level
 */
export class BackgroundManager extends Component {
  private backgrounds: BackgroundComponent[] = [];

  addBackground(background: BackgroundComponent) {
    this.backgrounds.push(background);
  }

  update(dt: number) {
    this.backgrounds.forEach((bg) => bg.update(dt));
  }

  dispose(): void {
    this.backgrounds.forEach((bg) => bg.dispose());
  }
}
