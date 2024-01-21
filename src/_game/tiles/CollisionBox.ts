import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';

import { ICollision } from '../data/ILevelData2';

export class CollisionBox extends Collision2D {
  constructor(eng: PlatformEngine, public options: Readonly<ICollision>) {
    super(eng, options.id ?? eng.random.getUuid(), null, options.box);

    if (options.meta.get('color')) {
      const colorValues = options.meta.get('color').split(',');
      if (colorValues.length == 4) {
        this._debugColor = new vec4(
          Number(colorValues[0]),
          Number(colorValues[1]),
          Number(colorValues[2]),
          Number(colorValues[3])
        );
      }
    }
    this.showCollision = options.meta.get('debug') == 'true';

    this.eng.physicsManager.setCollision(this);
  }
}
