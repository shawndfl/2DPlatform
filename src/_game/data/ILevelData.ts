import rect from '../../math/rect';
import vec2 from '../../math/vec2';

/**
 * This is the raw level data from json
 */
export interface ILevelData {
  /** the url to the tile sheet without the extension.
   * The level expects to find a .png and .json file with
   * this name in it.
   */
  tileSheetUrl: string;
  /**
   * Size of the level in pixels
   */
  size: [number, number];
  player: {
    pos: [number, number];
    meta: [[string, string]];
  };
  images: {
    id: string;
    type: string;
    pos: [number, number];
    size: [number, number];
    zIndex: number;
    image: string;
    images: [string];
    meta: [[string, string]];
    repeat: boolean;
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
  pos: vec2;
  meta: Map<string, string>;
}

export interface IImageTiles {
  id: string;
  type: string;
  /** image id into the tiles sheet */
  image: string;
  images: string[];
  meta: Map<string, string>;
  pos: vec2;
  size: vec2;
  zIndex: number;
  repeat: boolean;
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
  tileSheetUrl: string;
  player: IPlayerOptions;
  entities: IEntity[];
  collision: ICollision[];
  imageTiles: IImageTiles[];

  constructor(data: ILevelData) {
    this.entities = [];
    this.collision = [];
    this.imageTiles = [];

    this.size = new vec2(data.size);
    this.tileSheetUrl = data.tileSheetUrl;
    this.player = {
      meta: new Map<string, string>(data.player.meta),
      pos: new vec2(data.player.pos),
    };

    data.entities.forEach((e) => {
      const pos = new vec2(e.pos);
      const meta = new Map<string, string>(e.meta);
      this.entities.push({ id: e.id, pos, meta, type: e.type });
    });

    data.images?.forEach((e) => {
      const meta = new Map<string, string>(e.meta);
      const pos = new vec2(e.pos);
      const size = new vec2(e.size);
      this.imageTiles.push({
        id: e.id,
        meta,
        type: e.type,
        images: e.images,
        zIndex: e.zIndex,
        pos,
        size,
        image: e.image,
        repeat: e.repeat,
      });
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
      pos: new vec2(10, 100),
      meta: new Map<string, string>(),
    };
    this.entities = [];
    this.collision = [];
    this.imageTiles = [];
  }

  serialize(): string {
    const str = JSON.stringify(this, (_, value) => {
      if (value instanceof vec2) {
        return [value.x, value.y];
      } else if (value instanceof rect) {
        return [value.left, value.width, value.top, value.height];
      } else if (value instanceof Map) {
        return Array.from(value.entries());
      } else {
        return value;
      }
    });
    return str;
  }
}
