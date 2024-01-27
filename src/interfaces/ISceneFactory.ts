import { SceneComponent } from '../components/SceneComponent';

/**
 * Used to create scenes
 */
export interface ISceneFactory {
  createScene(type: string): SceneComponent;
}
