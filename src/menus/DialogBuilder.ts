import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import { IDialogParams } from '../menus/IDialogParams';

/**
 * This class is used to build the visual dialog box
 */
export class DialogBuilder extends Component {
  readonly continueIconX = 350;
  readonly continueIconY = 75;
  readonly tileWidth = 64;
  readonly tileHeight = 64;
  readonly iconScale = 1;
  readonly minWidth = 20;
  readonly minHeight = 20;
  protected _spriteController: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Set the sprite controller
   * @param spriteController
   */
  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
  }

  /**
   * Hides all the dialog box
   * @param dialogId
   */
  hideDialog(dialogId: string) {
    this._spriteController.removeSprite(dialogId + 'menu.left.top');
    this._spriteController.removeSprite(dialogId + 'menu.right.top');
    this._spriteController.removeSprite(dialogId + 'menu.right.bottom');
    this._spriteController.removeSprite(dialogId + 'menu.left.bottom');
    this._spriteController.removeSprite(dialogId + 'menu.center.top');
    this._spriteController.removeSprite(dialogId + 'menu.center.bottom');
    this._spriteController.removeSprite(dialogId + 'menu.left.middle');
    this._spriteController.removeSprite(dialogId + 'menu.right.middle');
    this._spriteController.removeSprite(dialogId + 'menu.center.middle');
  }

  /**
   * Creates and positions a dialog box
   * @param dialogId
   * @param spriteController
   * @param p
   */
  buildDialog(dialogId: string, p: IDialogParams) {
    // inner y is like the bottom corner of the text filed.
    // p.yPos is pixels from the top of the screen
    const innerTopLeft = new vec2(p.x + this.tileWidth * this.iconScale, p.y + this.tileWidth * this.iconScale);
    const innerTopRight = new vec2(
      p.x + (p.width - this.tileWidth * this.iconScale),
      p.y + this.tileHeight * this.iconScale
    );
    const innerBottomRight = new vec2(
      p.x + (p.width - this.tileWidth * this.iconScale),
      p.height + p.y - this.tileHeight * this.iconScale
    );

    const bottomRight = new vec2(p.x + (p.width - this.tileWidth * this.iconScale), p.height + p.y);
    const bottomLeft = new vec2(p.x + this.tileWidth * this.iconScale, p.height + p.y);

    // top left corner
    this._spriteController.activeSprite(dialogId + 'menu.left.top');
    this._spriteController.scale(this.iconScale);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(p.x, this.eng.height - innerTopLeft.y, p.depth);
    this._spriteController.setSprite('menu.left.top');

    // top right corner
    this._spriteController.activeSprite(dialogId + 'menu.right.top');
    this._spriteController.scale(this.iconScale);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(innerTopRight.x, this.eng.height - innerTopRight.y, p.depth);
    this._spriteController.setSprite('menu.right.top');

    // bottom right corner
    this._spriteController.activeSprite(dialogId + 'menu.right.bottom');
    this._spriteController.scale(this.iconScale);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(innerTopRight.x, this.eng.height - bottomRight.y, p.depth);
    this._spriteController.setSprite('menu.right.bottom');

    // bottom left corner
    this._spriteController.activeSprite(dialogId + 'menu.left.bottom');
    this._spriteController.scale(this.iconScale);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(p.x, this.eng.height - bottomLeft.y, p.depth);
    this._spriteController.setSprite('menu.left.bottom');

    // position the edges
    const topEdgeScale = (innerTopRight.x - innerTopLeft.x) / this.tileWidth;
    const rightEdgeScale = (innerBottomRight.y - innerTopRight.y) / this.tileHeight;

    // top edge
    this._spriteController.activeSprite(dialogId + 'menu.center.top');
    this._spriteController.scale({ x: topEdgeScale, y: this.iconScale });
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(innerTopLeft.x, this.eng.height - innerTopRight.y, p.depth);
    this._spriteController.setSprite('menu.center.top');

    // bottom edge
    this._spriteController.activeSprite(dialogId + 'menu.center.bottom');
    this._spriteController.scale({ x: topEdgeScale, y: this.iconScale });
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(innerTopLeft.x, this.eng.height - bottomRight.y, p.depth);
    this._spriteController.setSprite('menu.center.bottom');

    // left edge
    this._spriteController.activeSprite(dialogId + 'menu.left.middle');
    this._spriteController.scale({ x: this.iconScale, y: rightEdgeScale });
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(p.x, this.eng.height - innerBottomRight.y, p.depth);
    this._spriteController.setSprite('menu.left.middle');

    // right edge
    this._spriteController.activeSprite(dialogId + 'menu.right.middle');
    this._spriteController.scale({ x: this.iconScale, y: rightEdgeScale });
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(innerTopRight.x, this.eng.height - innerBottomRight.y, p.depth);
    this._spriteController.setSprite('menu.right.middle');

    // center
    this._spriteController.activeSprite(dialogId + 'menu.center.middle');
    this._spriteController.scale({ x: topEdgeScale, y: rightEdgeScale });
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSpritePosition(innerTopLeft.x, this.eng.height - innerBottomRight.y, p.depth);
    this._spriteController.setSprite('menu.center.middle');
  }
}
