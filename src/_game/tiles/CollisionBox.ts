import { Engine } from '../../core/Engine';
import { SpritBaseController } from '../../graphics/SpriteBaseController';
import rect from '../../math/rect';
import vec3 from '../../math/vec3';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';

import { ICollision } from '../data/ILevelData2';

export class CollisionBox extends Collision2D {
  constructor(eng: PlatformEngine, public options: Readonly<ICollision>) {
    super(eng, options.id ?? eng.random.getUuid(), null, options.box);

    this.showCollision = options.meta.get('debug') == 'true';
    this.eng.physicsManager.setCollision(this);
  }
}
