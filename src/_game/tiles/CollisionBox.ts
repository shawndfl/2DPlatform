import rect from '../../math/rect';
import vec4 from '../../math/vec4';
import { Collision2D } from '../../physics/Collision2D';
import { PlatformEngine } from '../PlatformEngine';

export interface ICollisionBoxOptions {
  id: string;
  debug: boolean;
  color: vec4;
  bounds: rect;
}

export class CollisionBox extends Collision2D {
  constructor(
    eng: PlatformEngine,
    public options: Readonly<ICollisionBoxOptions>
  ) {
    super(eng, options.id ?? eng.random.getUuid(), null, options.bounds);

    this._debugColor = options.color;
    this.showCollision = options.debug;

    this.eng.physicsManager.setCollision(this);
  }
}
