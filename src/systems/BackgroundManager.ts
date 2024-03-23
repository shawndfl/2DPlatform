import { Component } from '../components/Component';
import { TileImageComponent } from '../components/TileImageComponet';

/**
 * Manages different backgrounds and foregrounds in a level
 */
export class BackgroundManager extends Component {
  private backgrounds: TileImageComponent[] = [];

  addBackground(background: TileImageComponent) {
    this.backgrounds.push(background);
  }

  update(dt: number) {
    this.backgrounds.forEach((bg) => bg.update(dt));
  }

  dispose(): void {
    this.backgrounds.forEach((bg) => bg.dispose());
  }
}
