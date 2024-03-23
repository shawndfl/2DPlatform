import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBufferQuadInstance } from '../geometry/GlBufferQuadInstance';
import { IQuadModel } from '../geometry/IQuadMode';
import { toRadian } from '../math/constants';
import mat2 from '../math/mat2';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { SpriteInstanceShader } from '../shaders/SpriteInstanceShader';
import { SpriteFlip } from './ISprite';
import { SpriteData, TileData } from './ISpriteData';
import { Texture } from './Texture';

export interface QuadBuildArgs {
  /** Translation in pixel space */
  translation?: vec2;

  depth?: number;

  /** Color that is multiplied by the final color */
  color?: vec4;

  /**
   * Applied before the rotation and scale.
   * 0,0 is the center of the quad.
   * min (-1,-1) max(1,1)
   * To offset to bottom left corner offset(1,1)
   * To offset to top center offset (0, -1)
   */
  offset?: vec2;

  /** Rotation in degrees around the offset */
  rotation?: number;

  /** image scale */
  scale?: number;

  scaleWidth?: number;

  scaleHeight?: number;

  /** fip the image on the x axis */
  flipX?: boolean;

  /** fip the image on the y axis */
  flipY?: boolean;

  /** tile data for the sprite. This will be overridden by the above properties */
  tileData: TileData;
}

/**
 * Manages a collection of quads that all get rendered at once.s
 */
export class SpriteInstanceCollection extends Component {
  private shader: SpriteInstanceShader;
  private buffer: GlBufferQuadInstance;
  private _spriteTexture: Texture;
  private quads: Map<string, IQuadModel>;
  private dirty: boolean;
  private _spriteData: SpriteData;

  public get spriteData(): SpriteData {
    return this._spriteData;
  }

  public getLoc(id: string): [number, number, number, number] {
    const data = this._spriteData.tiles.get(id);
    if (!data) {
      console.debug('cannot find sprite ' + id + ' in texture ' + this._spriteTexture.id);
      return [0, 0, 32, 32];
    }
    return data.loc;
  }

  public get spriteTexture(): Texture {
    return this._spriteTexture;
  }

  constructor(eng: Engine) {
    super(eng);
    this.shader = new SpriteInstanceShader(eng.gl, 'instancing');
    this.buffer = new GlBufferQuadInstance(eng.gl);
    this.quads = new Map<string, IQuadModel>();

    //if (this.gl.MAX_VERTEX_ATTRIBS < 1) {
    //this.eng.canvasController.error('max attri ' + this.gl.MAX_VERTEX_ATTRIBS);
    //}
  }

  /**
   * Initialize a texture
   */
  initialize(texture: Texture, spriteData: SpriteData): void {
    this.clear();
    // save the sprite data
    this._spriteData = spriteData;
    this._spriteTexture = texture;
  }

  hasQuad(id: string): boolean {
    return this.quads.has(id);
  }

  /**
   * Get a quad from an id
   * @param id
   * @returns
   */
  getQuad(id: string): IQuadModel {
    return this.quads.get(id);
  }

  /**
   * Removes a quad
   * @param id
   */
  removeQuad(id: string): void {
    this.quads.delete(id);
    this.dirty = true;
  }

  /**
   * Add or update a quad.
   * @param quad
   */
  addQuad(id: string, quad: IQuadModel): void {
    this.quads.set(id, quad);
    this.dirty = true;
  }

  /**
   * Set the flag to update the buffer
   */
  public setDirty(): void {
    this.dirty = true;
  }

  /**
   * Commit the quads to the vertex buffers
   * @param force
   */
  protected commitToBuffer(force?: boolean): void {
    if (this.dirty || force) {
      const array = Array.from(this.quads.values());
      this.buffer.setBuffers(array);
    }
    this.dirty = false;
  }

  pixelsToUv(loc: [number, number, number, number], flip: SpriteFlip, resultsMin: vec2, resultsMax: vec2): void {
    const sheetW = this._spriteTexture.width;
    const sheetH = this._spriteTexture.height;

    if (!loc[2]) {
      loc[2] = sheetW;
    }
    if (!loc[3]) {
      loc[3] = sheetH;
    }

    let minX = loc[0] / sheetW;
    let minY = 1.0 - loc[1] / sheetH;
    let maxX = (loc[0] + loc[2]) / sheetW;
    let maxY = 1.0 - (loc[1] + loc[3]) / sheetH;

    if (flip == SpriteFlip.Both || flip == SpriteFlip.XFlip) {
      resultsMin.x = maxX;
      resultsMax.x = minX;
    } else {
      resultsMin.x = minX;
      resultsMax.x = maxX;
    }

    if (flip == SpriteFlip.Both || flip == SpriteFlip.YFlip) {
      resultsMin.y = maxY;
      resultsMax.y = minY;
    } else {
      resultsMin.y = minY;
      resultsMax.y = maxY;
    }
  }

  /**
   * clear out the sprites
   */
  clear(): void {
    this.quads.clear();
    this.setDirty();
  }

  /**
   * For testing
   * @param dt
   */
  update(dt: number, projection?: mat4): void {
    if (this.quads.size == 0) {
      return;
    }

    this.commitToBuffer();

    const view = this.eng.viewManager;
    projection = projection ?? view.projection;

    this.shader.setSpriteSheet(this.spriteTexture);
    this.shader.enable();

    // set the project
    this.shader.setProj(projection);

    if (!this.buffer.enable()) {
      this.eng.canvasController.error('error with buffer');
    }
    const type = this.gl.UNSIGNED_SHORT;

    this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.buffer.indexCount, type, 0, this.buffer.instanceCount);
  }
}
