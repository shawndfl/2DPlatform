import { LevelConstructionParams } from './LevelConstructionParams';

/**
 * These are cell properties that are used by the Ground class
 * to make interesting levels.
 */
export interface ICellProps {
  id: string;
  heightIncreaseAxis: [number][number];
}

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  /** the formate is <tile type|sprite id> */
  typesAndSprites: string[];
  /** the index returned by the cells is offset by 10 to make it easier to align number in the json */
  cells: number[][][];

  /** used to build the auto generated parts of the level */
  levelConstruction: LevelConstructionParams;
}
