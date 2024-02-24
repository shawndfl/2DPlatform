import { Engine } from '../../core/Engine';
import { SpriteController2 } from '../../graphics/SpriteController2';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { PlatformEngine } from '../PlatformEngine';
import {
  EnemyController,
  EnemyControllerOptions,
} from '../components/EnemyController';
import { GameComponent } from '../components/GameComponent';
import { ICollision, IEntity } from '../data/ILevelData';
import { ICollisionBoxOptions } from './CollisionBox';

export class EntityFactory {
  static create(eng: PlatformEngine, args: IEntity): GameComponent {
    let entity: GameComponent;

    // some common variables
    const id = args.id;
    const debug = args.meta.get('debug') == 'true';
    const color = this.stringToVec4(
      args.meta.get('color'),
      new vec4(1, 1, 0, 1)
    );
    const pos = args.pos;

    // create different collision types
    if (args.type == 'enemy') {
      const options: EnemyControllerOptions = {
        id: args.id,
        health: Number(args.meta.get('health')),
        pos: pos,
        spriteName: args.meta.get('sprite'),
      };

      entity = new EnemyController(eng, options);
    } else {
      console.error('cannot create: ' + args.type);
    }

    return entity;
  }

  static stringToVec2(value: string, dest?: vec2): vec2 {
    if (!dest) {
      dest = new vec2();
    }
    if (value) {
      const components = value.split(',');
      if (components.length > 1) {
        dest.x = Number(components[0]);
        dest.y = Number(components[1]);
      }
    }
    return dest;
  }

  static stringToVec4(value: string, dest: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }
    if (value) {
      const components = value.split(',');
      if (components.length > 3) {
        dest.x = Number(components[0]);
        dest.y = Number(components[1]);
        dest.z = Number(components[2]);
        dest.w = Number(components[3]);
      }
    }
    return dest;
  }
}
