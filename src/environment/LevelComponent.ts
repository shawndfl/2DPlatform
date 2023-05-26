import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { LevelConstructionParams } from './LevelConstructionParams';
import { LevelGenerator } from './LevelGenerator';
import { LevelGeneratorState } from './LevelGeneratorState';

/**
 * This is an abstract class used to create componets of a level.
 * Like buildings enemies, portals, complex items, etc.
 */
export abstract class LevelComponent extends Component {
  protected _levelGenerator: LevelGenerator;

  get params(): LevelConstructionParams {
    return this._levelGenerator.creationParams;
  }

  get state(): LevelGeneratorState {
    return this._levelGenerator.levelState;
  }

  protected _state: LevelGeneratorState;

  constructor(eng: Engine) {
    super(eng);
  }

  initialize(levelGenerator: LevelGenerator) {
    this._levelGenerator = levelGenerator;
  }

  abstract generate(tiles: TileComponent[][][]): void;
}
