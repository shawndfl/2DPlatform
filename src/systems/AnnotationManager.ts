import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { TileData } from '../graphics/ISpriteData';
import { SpriteInstanceCollection } from '../graphics/SpriteInstanceCollection';
import { SpriteInstanceController } from '../graphics/SpriteInstanceController';
import { toDegrees, toRadian } from '../math/constants';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

export interface LineArgs {
  id?: string;
  start: vec2;
  end: vec2;
  color: vec4;
  /** range -1 near, 1 far */
  depth?: number;
  /** in pixels */
  thickness?: number;
  endArrow?: boolean;
}

export class AnnotationManager extends Component {
  private _lineSprites: SpriteInstanceCollection;

  constructor(eng: Engine) {
    super(eng);
    this._lineSprites = new SpriteInstanceCollection(eng);
    //this._boundSprites = new SpriteInstanceController(eng);
  }

  reset(): void {
    this._lineSprites.clear();
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
    const controller = new SpriteInstanceController(id, this._lineSprites);
    controller.left = args.start.x;
    controller.top = args.start.y;
    controller.spriteImage('block');
    controller.leftOffset = 1;
    controller.topOffset = -0.5;
    controller.depth = args.depth ?? -0.4;
    controller.colorScale = args.color ?? new vec4([0, 0, 0, 1]);
    controller.xScale = distance * 0.5;
    controller.yScale = args.thickness ?? 1;
    controller.angle = rotation;
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
  buildRect(
    id: string,
    bounds: Readonly<rect>,
    color: vec4,
    depth?: number
  ): void {
    this.buildLine({
      id: id + '_left',
      start: new vec2(bounds.left, bounds.bottom),
      end: new vec2(bounds.left, bounds.top),
      color,
      depth,
    });
    this.buildLine({
      id: id + '_top',
      start: new vec2(bounds.left, bounds.top),
      end: new vec2(bounds.right, bounds.top),
      color,
      depth,
    });
    this.buildLine({
      id: id + '_right',
      start: new vec2(bounds.right, bounds.top),
      end: new vec2(bounds.right, bounds.bottom),
      color,
      depth,
    });
    this.buildLine({
      id: id + '_bottom',
      start: new vec2(bounds.left, bounds.bottom),
      end: new vec2(bounds.right, bounds.bottom),
      color,
      depth,
    });
  }

  initialize() {
    this._lineSprites.initialize(
      this.eng.assetManager.menu.texture,
      this.eng.assetManager.menu.data
    );
  }

  update(dt: number) {
    this._lineSprites.update(dt);
  }
}
