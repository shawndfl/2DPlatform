import { Curve, CurveType } from '../../math/Curve';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';
import { EnemyController } from '../components/EnemyController';
import { PlayerController } from '../components/PlayerController';

import { ICollision } from '../data/ILevelData';
import { CollisionBox, ICollisionBoxOptions } from './CollisionBox';

export interface IBottomlessOptions extends ICollisionBoxOptions {}

/**
 * This is an elevator that can move up and down and side to side
 */
export class Bottomless extends CollisionBox {
  constructor(eng: PlatformEngine, public options: Readonly<IBottomlessOptions>) {
    super(eng, options);
  }

  collisionTriggered(others: Collision2D[]): void {
    super.collisionTriggered(others);

    // see if the player hit this
    for (let other of others) {
      if (other.tag instanceof PlayerController) {
        const player = other.tag as PlayerController;
        player.hitByDeath(this);
        break;
      }
      if (other.tag instanceof EnemyController) {
        const enemy = other.tag as EnemyController;
        enemy.hitByDeath(this);
        break;
      }
    }
  }

  update(dt: number) {}
}
