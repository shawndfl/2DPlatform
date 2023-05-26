import { EnvironmentData } from './EnvironmentData';
import { PlayerData } from './PlayerData';

export class GameData {
  environment: EnvironmentData = new EnvironmentData();
  player: PlayerData = new PlayerData();
}
