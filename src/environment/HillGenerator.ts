import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { LevelComponent } from './LevelComponent';

/**
 * Creates a hill
 */
export class HillGenerator extends LevelComponent {
  size: number;
  height: number;

  constructor(eng: Engine) {
    super(eng);
  }

  generate(): void {
    this.size = 10;
    this.height = 2;
    const startI = 10;
    const startJ = 10;
    const startK = 1;

    if (
      this._levelGenerator.HasSpace({
        startI: startI,
        startJ: startJ,
        startK: startK,
        height: this.height,
        width: this.size,
        length: this.size,
      })
    ) {
      const endI = startI + this.size;
      const endJ = startJ + this.size;
      for (let i = startI; i < endI; i++) {
        for (let j = startJ; j < endJ; j++) {
          let tileName;

          // this logic will place grass with black edges as an outline
          // around the blocks that are at a level above
          if (i == startI && j == startJ) {
            tileName = this._levelGenerator.getFloorTileEdgeBoth();
          } else if (i == startI) {
            tileName = this._levelGenerator.getFloorTileEdgeLeft();
          } else if (j == startJ) {
            tileName = this._levelGenerator.getFloorTileEdgeRight();
          } else {
            tileName = this._levelGenerator.getFloorTile();
          }

          this._levelGenerator.createTile(tileName, i, j, startK);
        }
      }

      this._levelGenerator.createTile(this._levelGenerator.getSlopTileLeft(), startI, endJ, startK);
    } else {
      console.debug('no space for a hill');
    }
  }
}
