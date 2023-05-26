import { PlayerController } from '../components/PlayerController';
import { TileComponent } from '../components/TileComponent';

export interface IBattleGraphics {
  background: string;
  surface: string;
  rightSide: string;
  leftSide: string;
}

export interface IBattleData {
  song?: string;
  graphics?: IBattleGraphics;
  enemies?: [
    {
      id: string;
      tile: [number, number];
    }
  ];
}
