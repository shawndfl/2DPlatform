import { IBattleData } from '../battle/IBattleData';
import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import { TileFactory } from './TileFactory';

export enum BattleState {
  None,
  ScreenWipeToBattle,
  LoadBattleScene,
  ShowEnemies,
  ShowPlayer,
  ShowMenu,
  PlayerAttack,
  EnemyHit,
  EnemyAttack,
  PlayerHit,
  PlayerUseItem,
  EnemyDie,
  PlayerDie,
  PlayerWin,
  StatsUpdate,
  LevelUp,
  ScreenWipeToWorld,
}

/**
 * Manages the active battle
 */
export class BattleManager extends Component {
  /** Used to render all the tiles */
  protected _spriteController: SpritBatchController;
  /** used to crate the tiles from the model data */
  protected _tileFactory: TileFactory;
  /** tiles that require an update */
  protected _updateTiles: TileComponent[];

  protected _active: boolean;
  private _ready: boolean;
  private _curve: Curve;
  private _battleState: BattleState;

  constructor(eng: Engine) {
    super(eng);
    this._active = false;
    this._curve = new Curve();
    this._curve.points([
      { p: 1, t: 0 },
      { p: 0.55, t: 500 },
      { p: 1, t: 1000 },
    ]);
    this._curve.curve(CurveType.linear);
    this._curve.pause();
    this._curve.onDone = () => {
      this._ready = true;
    };

    this._battleState = BattleState.None;
    this._spriteController = new SpritBatchController(this.eng);
  }

  /**
   * Initialize the battle
   */
  async initialize() {
    const texture = this.eng.assetManager.tile.texture;
    const data = this.eng.assetManager.tile.data;
    this._spriteController.initialize(texture, data);
    this._tileFactory = new TileFactory(this.eng, this._spriteController);
  }

  startBattle(battleData: IBattleData) {
    if (this._active) {
      console.warn('already in a battle');
      return;
    }

    // TODO show transition
    // load battle scene
    // show enemies
    // show player
    // show menu options
    // show stats
    this._ready = false;
    this._active = true;
    this._curve.start(
      true,
      () => {
        this._ready = true;

        //TODO build battle scene
        this.eng.scene.ground.buildBattleScene();
        this.eng.dialogManager.showDialog('Start Fighting', { x: 200, y: 20, width: 600, height: 200 });
        //this.eng.soundManager.
      },
      (value) => {
        this.eng.viewManager.scale = this._curve.getValue();
      }
    );
  }

  update(dt: number) {
    this._curve.update(dt);

    if (this._ready) {
    }
  }
}
