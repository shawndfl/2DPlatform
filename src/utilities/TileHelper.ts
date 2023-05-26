import { Component } from '../components/Component';
import mat4 from '../math/mat4';
import vec3 from '../math/vec3';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';

/**
 * This class is used to convert tile and screen coordinates
 */
export class TileHelper extends Component {
  protected _toScreen: mat4;
  protected _toTile: mat4;
  readonly depthScale: number;

  constructor(eng: Engine) {
    super(eng);
    this.depthScale = 50;
    this.calculateTransform();
  }

  private calculateTransform() {
    const screenWidth = this.eng.width;
    const screenHeight = this.eng.height;

    const scale = 2.0;
    const tileSize = 32;
    const cellSize = tileSize * scale;
    const halfCell = cellSize * 0.5;
    const quarterCell = cellSize * 0.25;

    const xAxis = new vec3([halfCell, -halfCell, 0]);
    const yAxis = new vec3([-quarterCell, -quarterCell, halfCell]);
    const zAxis = new vec3([
      (-quarterCell / (screenHeight * this.depthScale)) * 2,
      (-quarterCell / (screenHeight * this.depthScale)) * 2,
      0,
    ]);

    // translation part
    const halfWidth = screenWidth * 0.5;
    const heightOffset = screenHeight - quarterCell;
    const trans = new vec3([halfWidth, heightOffset, 1]);

    // create matrix
    this._toScreen = new mat4([
      xAxis.x,
      yAxis.x,
      zAxis.x,
      0,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      0,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      0,
      trans.x,
      trans.y,
      trans.z,
      1.0,
    ]);

    this._toTile = this._toScreen.copy();
    this._toTile.inverse();
  }

  /**
   * Rotates a vector in the xy plane to a ~45 degree isometric plane
   * @param tileVector
   * @returns
   */
  rotateToTileSpace(tileVector: vec3 | vec2): vec3 {
    let world = new vec3(tileVector.x, tileVector.y, (tileVector as any).z ?? 0);

    const right = new vec3(0.5, -0.5, 0);
    const up = new vec3(-0.5, -0.5, 0);

    const x = vec3.dot(world, right.normalize());
    const y = vec3.dot(world, up.normalize());
    return new vec3(x, y, 0);
  }

  rotateFromTileSpace(screenVector: vec3 | vec2): vec3 {
    let world = new vec3(screenVector.x, screenVector.y, (screenVector as any).z ?? 0);

    const d = 1.0 / (-0.25 - 0.25);
    const right = new vec3(d * -0.5, d * 0.5, 0);
    const up = new vec3(d * 0.5, d * 0.5, 0);

    const x = vec3.dot(world, right.normalize());
    const y = vec3.dot(world, up.normalize());
    return new vec3(x, y, 0);
  }

  /**
   * Converts a touch point in pixels to a tile location given a tile height index.
   * @param touchPoint
   * @param heightIndex 0 is floor level. The higher the index the higher the y pos
   * @returns
   */
  screenTouchToTile(touchPoint: vec2, heightIndex: number) {
    const scaleHeight = this.eng.height * this.eng.tileHelper.depthScale;

    const screen = new vec3();

    // x and y screen points are offset by the projection offset.
    screen.x = touchPoint.x;
    screen.y = touchPoint.y;

    // this is offset based on the height index of the tile you are hitting
    const yOffset = screen.y + 8 * heightIndex;

    // the depth range is from 1 to -1, back to front. Calculate the z depth
    screen.z = (yOffset / scaleHeight - this.eng.height / scaleHeight) * 2 + 1;

    const touchTile = this.eng.tileHelper.toTileLoc(
      new vec3(screen.x, screen.y, screen.z),
      this.eng.viewManager.projection
    );

    return touchTile;
  }

  toTileLoc(screenPixels: vec3, proj?: mat4): vec3 {
    let cell = this._toTile.multiplyVec3(screenPixels);
    return cell;
  }

  toScreenLoc(i: number, j: number, k: number): vec3 {
    const cell = new vec3([i, j, k]);
    const screen = this._toScreen.multiplyVec3(cell);

    return screen;
  }
}
