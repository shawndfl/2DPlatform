/**
 * Timer class for checking elapsed time.
 */
export class Timer {
  private _startTime: number;
  private getTime: () => number;

  /**
   * Get the elapsed time in ms
   */
  get elapsed(): number {
    return this.getTime() - this._startTime;
  }

  constructor() {
    if (window.performance.now) {
      console.log('Using high performance timer');
      this.getTime = () => {
        return window.performance.now();
      };
    } else {
      console.log('Using low performance timer');
      this.getTime = () => {
        return new Date().getTime();
      };
    }

    this._startTime = this.getTime();
  }

  /**
   * Start the timer
   */
  start() {
    this._startTime = this.getTime();
  }
}
