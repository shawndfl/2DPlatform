import { SceneComponent } from '../../components/SceneComponent';
import { GameComponent } from '../components/GameComponent';
import { PlatformEngine } from '../PlatformEngine';
import { Level2 } from './Level2';

/**
 * Used to create scenes
 */
export class SceneFactory extends GameComponent {
  constructor(eng: PlatformEngine) {
    super(eng);
  }

  /**
   * When creating a scene
   * @param type
   * @returns
   */
  createScene(type: string): SceneComponent {
    return new Level2(this.eng, type);
  }
}
