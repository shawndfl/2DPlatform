import vec2 from '../math/vec2';

/**
 * How this level should be created
 */
export class LevelConstructionParams {
  /** seed for generating the level */
  seed: number;

  /** the position of the player */
  playerPos?: vec2;

  /** Portals */
  portals?: vec2[];

  /** size of the level */
  width: number;
  length: number;
  height: number;

  maxItems?: number;

  maxEnemies?: number;
}
