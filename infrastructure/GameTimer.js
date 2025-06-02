export class GameTimer {
  constructor(onTick) {
    this._interval = null;
    this._seconds = 0;
    this._onTick = onTick;
  }

  start() {
    this.stop();
    this._seconds = 0;
    this._interval = setInterval(() => {
      this._seconds++;
      if (this._onTick) this._onTick(this._seconds);
    }, 1000);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  reset() {
    this.stop();
    this._seconds = 0;
    if (this._onTick) this._onTick(this._seconds);
  }

  get seconds() {
    return this._seconds;
  }
}