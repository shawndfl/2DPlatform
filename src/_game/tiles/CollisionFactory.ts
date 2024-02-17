import { Engine } from '../../core/Engine';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';
import { ICollision } from '../data/ILevelData';
import { Bottomless, IBottomlessOptions } from './Bottomless';
import { CollisionBox, ICollisionBoxOptions } from './CollisionBox';
import { Elevator, IElevatorOptions } from './Elevator';

export class CollisionFactory {
  static create(eng: PlatformEngine, args: ICollision): Collision2D {
    let collision: Collision2D;

    // some common variables
    const id = args.id;
    const debug = args.meta.get('debug') == 'true';
    const color = this.stringToVec4(
      args.meta.get('color'),
      new vec4(1, 1, 0, 1)
    );
    const bounds = args.box;

    // create different collision types
    if (args.type == 'box') {
      const options: ICollisionBoxOptions = {
        id,
        bounds,
        color,
        debug,
      };
      collision = new CollisionBox(eng, options);
    } else if (args.type == 'elevator') {
      const options: IElevatorOptions = {
        id,
        bounds,
        color,
        debug,
        msTime: Number(args.meta.get('msTime')),
        offset: this.stringToVec2(args.meta.get('offset')),
      };
      collision = new Elevator(eng, options);
    } else if (args.type == 'bottomless') {
      const options: IBottomlessOptions = {
        id,
        bounds,
        color,
        debug,
      };
      collision = new Bottomless(eng, options);
    } else {
      console.error('cannot create: ' + args.type);
    }

    return collision;
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
