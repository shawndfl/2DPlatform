import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { TileData } from '../graphics/ISpriteData';
import { SpriteInstanceController } from '../graphics/SpriteInstanceController';
import { toDegrees, toRadian } from '../math/constants';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { BuiltInTextureAssets } from './AssetManager';

export interface LineArgs {
  id?: string;
  start: vec2;
  end: vec2;
  color: vec4;
  /** in pixels */
  thickness?: number;
  endArrow?: boolean;
}

export class AnnotationManager extends Component {
  private _lineSprites: SpriteInstanceController;

  private tileData: TileData;

  constructor(eng: Engine) {
    super(eng);
    this._lineSprites = new SpriteInstanceController(eng);
    //this._boundSprites = new SpriteInstanceController(eng);
  }

  removeAnnotation(id: string): void {
    this._lineSprites.removeQuad(id);
  }

  removeLine(id: string): void {
    this._lineSprites.removeQuad(id + '_line');
  }

  removeRect(id: string): void {
    this.removeLine(id + '_left');
    this.removeLine(id + '_right');
    this.removeLine(id + '_top');
    this.removeLine(id + '_bottom');
  }

  /**
   * builds a line
   * @param args
   */
  buildLine(args: LineArgs): void {
    const id = args.id + '_line';
    const rotation = toDegrees(
      Math.atan2(args.end.y - args.start.y, args.end.x - args.start.x)
    );
    const distance = args.end.copy().subtract(args.start).length();
    this._lineSprites.buildQuad(id, {
      translation: args.start,
      offset: new vec2(1, 0),
      depth: 0.5,
      color: args.color ?? new vec4([0, 0, 0, 1]),
      scaleWidth: distance * 0.5, // because of the offset is half the distance from center
      scaleHeight: args.thickness ?? 1,
      rotation: rotation,
      tileData: this.tileData,
    });
  }

  buildCrossHair(id: string, bounds: Readonly<rect>, color: vec4): void {
    const midX = (bounds.left + bounds.right) * 0.5;
    const midY = (bounds.top + bounds.bottom) * 0.5;
    this.buildLine({
      id: id + '_vertical',
      start: new vec2(midX, bounds.top),
      end: new vec2(midX, bounds.bottom),
      color,
    });
    this.buildLine({
      id: id + '_horizontal',
      start: new vec2(bounds.left, midY),
      end: new vec2(bounds.right, midY),
      color,
    });
  }

  /**
   * Builds a rect
   * @param id
   * @param bounds
   * @param color
   */
  buildRect(id: string, bounds: Readonly<rect>, color: vec4): void {
    this.buildLine({
      id: id + '_left',
      start: new vec2(bounds.left, bounds.bottom),
      end: new vec2(bounds.left, bounds.top),
      color,
    });
    this.buildLine({
      id: id + '_top',
      start: new vec2(bounds.left, bounds.top),
      end: new vec2(bounds.right, bounds.top),
      color,
    });
    this.buildLine({
      id: id + '_right',
      start: new vec2(bounds.right, bounds.top),
      end: new vec2(bounds.right, bounds.bottom),
      color,
    });
    this.buildLine({
      id: id + '_bottom',
      start: new vec2(bounds.left, bounds.bottom),
      end: new vec2(bounds.right, bounds.bottom),
      color,
    });
  }

  initialize() {
    this._lineSprites.initialize();

    // setup texture and tile data
    this._lineSprites.setTexture(this.eng.assetManager.menu.texture);
    this.tileData = this.eng.assetManager.getSpriteInfo(
      BuiltInTextureAssets.Menu,
      'block'
    );
  }

  update(dt: number) {
    this._lineSprites.update(dt);
  }
}
