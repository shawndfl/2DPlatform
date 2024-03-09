import { GameComponent } from './GameComponent';
import { PlayerController } from './PlayerController';

export enum DecisionAction {
  Idle = 0,
  MoveLeft = 1,
  MoveRight = 2,
  Jump = 3,
  JumpRight = 4,
  JumpLeft = 5,
  Shoot = 6,
  Length,
}

export interface PlayerState {
  currentAction: DecisionAction;
  lastAction: DecisionAction;
  player: PlayerController;
}

export class DecisionOptions {
  /** how quick can a decision be made */
  decisionDelay: number = 500;
  /** vector of bias for each decision  */
  bias: number[] = [1, 1, 1, 1, 1];
}

export class DecisionMaker extends GameComponent {
  public get delayUntilNexDecision(): number {
    return this.options.decisionDelay;
  }

  private options: DecisionOptions = new DecisionOptions();
  private timeLeft: number = 0;

  public onDecide: (action: DecisionAction) => void;

  initialize(options: DecisionOptions): void {
    this.options = options;
    this.timeLeft = this.options.decisionDelay;
  }

  private decide(): DecisionAction {
    // look at player
    // position, distance
    // look at player state firing, jumping, etc.
    // hiding behind something.
    // look at environment
    // path to character
    // path away from character
    const value = Math.floor(
      this.eng.random.rand() * (DecisionAction.Length + 1)
    );
    return value as DecisionAction;
  }

  update(dt: number): void {
    this.timeLeft -= dt;

    // time to decide
    if (this.timeLeft < 0) {
      if (this.onDecide) {
        // decide what to do
        this.onDecide(this.decide());
      }
      // reset the delay
      this.timeLeft = this.options.decisionDelay;
    }
  }
}
