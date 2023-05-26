/**
 * The state of the level generation
 */
export class LevelGeneratorState {
  /** current i,j,k cell locations */
  i: number;
  j: number;
  k: number;

  /** was the player placed */
  playerPlaced: boolean;

  itemCount: number;

  houseCount: number;
}
