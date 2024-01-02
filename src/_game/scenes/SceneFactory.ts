import { Component } from '../../components/Component';
import { SceneComponent } from '../../components/SceneComponent';
import { Engine } from '../../core/Engine';
import { Level1 } from './Level1';
import { GameComponent } from '../components/GameComponent';
import { PlatformEngine } from '../PlatformEngine';
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
      case 'level.1.0':
        return new Level1(this.eng);
      //case 'levelRenderTest':
      //    return new LevelRenderTest(this.eng);
    }
  }
}
