import { SceneComponent } from '../../components/SceneComponent';
import { GameComponent } from '../components/GameComponent';
import { PlatformEngine } from '../PlatformEngine';
import { Level2 } from './Level2';
//import { LevelRenderTest } from "./LevelRenderTest";

/**
 * Used to create scenes
 */
export class SceneFactory extends GameComponent {
  constructor(eng: PlatformEngine) {
    super(eng);
  }

  createScene(type: string): SceneComponent {
    switch (type) {
      //case 'levelRenderTest':
      //  return new LevelRenderTest(this.eng);
      case 'level.2.0':
        return new Level2(this.eng);
    }
  }
}
