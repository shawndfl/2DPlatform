import rect from '../../math/rect';
import vec2 from '../../math/vec2';

/**
 * This is the raw level data from json
 */
export interface ILevelData {
  size: [number, number];
  player: {
    pos: [number, number];
    meta: [[string, string]];
  };
  backgrounds: {
    id: string;
    type: string;
    image: string;
    meta: [[string, string]];
  }[];
  entities: {
    id: string;
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

export interface IPlayerOptions {
  position: vec2;
  meta: Map<string, string>;
}

export interface IBackgrounds {
  id: string;
  type: string;
  image: string;
  meta: Map<string, string>;
}

export interface IEntity {
  id: string;
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

export const DefaultLevelWidth = 1920 * 8;
export const DefaultLevelHeight = 1020;

/**
 * This is the level data that will be used in code.
 */
export class LevelData {
  size: vec2;
  player: IPlayerOptions;
  entities: IEntity[];
  collision: ICollision[];
  backgrounds: IBackgrounds[];

  constructor(data: ILevelData) {
    this.entities = [];
    this.collision = [];
    this.backgrounds = [];

    this.size = new vec2(data.size);
    this.player = {
      meta: new Map<string, string>(data.player.meta),
      position: new vec2(data.player.pos),
    };

    data.entities.forEach((e) => {
      const pos = new vec2(e.pos);
      const meta = new Map<string, string>(e.meta);
      this.entities.push({ id: e.id, pos, meta, type: e.type });
    });

    data.backgrounds.forEach((e) => {
      const meta = new Map<string, string>(e.meta);
      this.backgrounds.push({ id: e.id, image: e.image, meta, type: e.type });
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

  reset(): void {
    this.size = new vec2(DefaultLevelWidth, DefaultLevelHeight);
    this.player = {
      position: new vec2(10, 100),
      meta: new Map<string, string>(),
    };
    this.entities = [];
    this.collision = [];
    this.backgrounds = [];
  }
}
