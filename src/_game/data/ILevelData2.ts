import { Line } from '../../data/Line';
import rect from '../../math/rect';
import vec2 from '../../math/vec2';

/**
 * This is the raw level data from json
 */
interface ILevelData2 {
  entities: {
    type: string;
    pos: [number, number];
    meta: [[string, string]];
  }[];
  collision: {
    id: string;
    type: string;
    box: [number, number, number, number];
    meta: [[string, string]];
  }[];
}

export interface IEntity {
  type: string;
  pos: Readonly<vec2>;
  meta: Map<string, string>;
}

export interface ICollision {
  id: string;
  box: rect;
  type: string;
  meta: Map<string, string>;
}

/**
 * This is the level data that will be used in code.
 */
export class LevelData2 {
  entities: IEntity[];
  collision: ICollision[];

  constructor(data: ILevelData2) {
    this.entities = [];
    this.collision = [];
    data.entities.forEach((e) => {
      const pos = new vec2(e.pos);
      const meta = new Map<string, string>(e.meta);
      this.entities.push({ pos, meta, type: e.type });
    });

    data.collision.forEach((e) => {
      const meta = new Map<string, string>(e.meta);
      this.collision.push({
        id: e.id,
        box: new rect(e.box),
        meta,
        type: e.type,
      });
    });
  }
}
