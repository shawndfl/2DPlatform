import { Curve, CurveType } from '../../math/Curve';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';
import { PlayerController } from '../components/PlayerController';

import { ICollision } from '../data/ILevelData2';
import { CollisionBox, ICollisionBoxOptions } from './CollisionBox';

export interface IBottomlessOptions extends ICollisionBoxOptions {}

/**
 * This is an elevator that can move up and down and side to side
 */
export class Bottomless extends CollisionBox {
  constructor(
    eng: PlatformEngine,
    public options: Readonly<IBottomlessOptions>
  ) {
    super(eng, options);
  }

  collisionTriggered(other: Collision2D): void {
    super.collisionTriggered(other);
    if (!other) {
      return;
    }

    // attach it
    if (other.tag instanceof PlayerController) {
      this.eng.sceneManager.setNextScene('level.2.0');
      console.debug('die');
    }
  }

  update(dt: number) {}
}
