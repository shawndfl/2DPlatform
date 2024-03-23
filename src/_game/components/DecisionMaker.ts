import { GameComponent } from './GameComponent';
import { PlayerController } from './PlayerController';

export enum DecisionAction {
  Idle = 0,
  MoveLeft = 1,
  MoveRight = 2,
  Jump = 3,
  Shoot = 4,
  Length,
}

export interface PlayerState {
  currentAction: DecisionAction;
  lastAction: DecisionAction;
  player: PlayerController;
}

export class DecisionOptions {
  /** how quick can a decision be made */
  decisionDelay: number = 1500;
  /**
   * vector of bias for each decision
   * You can think of this as how many tickets
   * each decision gets. 0 means no chance of being picked,
   * 1 means one chance to get picked,
   * 50 means 50 changes of getting picked, etc.
   */
  bias: number[] = [5, 2, 1, 3, 3];
}

export class DecisionMaker extends GameComponent {
  public get delayUntilNexDecision(): number {
    return this.options.decisionDelay;
  }

  private lastAction: DecisionAction;

  private options: DecisionOptions = new DecisionOptions();
  private timeLeft: number = 0;

  public onValidate: (lastAction: DecisionAction, newAction: DecisionAction) => DecisionAction;
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
    //const value = Math.floor(this.eng.random.rand() * (DecisionAction.Length + 1));
    let value = 0;
    let range = 0;
    this.options.bias.forEach((v) => (range += v));

    let choice = Math.floor(this.eng.random.rand() * range + 1);
    for (let i = 0; i < this.options.bias.length; i++) {
      const limit = this.options.bias[i];
      if (choice < limit) {
        value = i as DecisionAction;
        break;
      }
      choice -= this.options.bias[i];
    }
    return value as DecisionAction;
  }

  update(dt: number): void {
    this.timeLeft -= dt;

    // time to decide
    if (this.timeLeft < 0) {
      if (this.onDecide) {
        // pick an action
        let action = this.decide();

        // validate the action
        if (this.onValidate) {
          action = this.onValidate(this.lastAction, action);
        }

        // do the thing
        this.onDecide(action);

        // save the last action
        this.lastAction = action;
      }
      // reset the delay
      this.timeLeft = this.options.decisionDelay;
    }
  }
}
