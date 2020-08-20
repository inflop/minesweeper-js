"use strict";

class Game {
  constructor(config) {
    this._config = config;
  }

  create() {
    this.board = new Board(this._config);
    this.renderer = new BoardRenderer(this.board);
    this.renderer.refreshBoard();

    this.resultDiv = document.querySelector('.summary-result');
    this.flaggedCounterDiv = document.querySelector('.flaggedCounter');
    this.timerDiv = document.querySelector('.timer');

    this._clear();

    this.board.addEventListener('complete', this._complete.bind(this), false);
    this.board.addEventListener('change', this._change.bind(this), false);

    this._updateFlaggedCellsCount();
    this._updateTime();

    this._stopTimer();

    this._started = false;
  }

  _complete(e) {
    if (!e) return;

    this._stopTimer();

    const state = e.detail.state;
    const msg = `You ${state === BoardState.EXPLODED ? 'lost &#128078' : 'won &#128077'}`;
    const color = (state === BoardState.EXPLODED ? 'red' : 'green');

    this.resultDiv.innerHTML = msg;
    this.resultDiv.style.color = color;
    this.flaggedCounterDiv.innerHTML = '';
  }

  _startTimer() {
    let count = 1;
    this._timeRunner = setInterval(() => {
      this._updateTime(count++);
    }, 1000);
  }

  _stopTimer() {
    var id = window.setInterval(() => {}, 0);
    while (id--) window.clearInterval(id);
  }

  _clear() {
    this.resultDiv.innerHTML = '';
    this.flaggedCounterDiv.innerHTML = '';
    this.timerDiv.innerHTML = '';
    this._started = false;
  }

  _change(e) {
    if (!e) return;

    if (!this._started && !this.board.completed) {
      this._started = true;
      this._startTimer();
    }

    // this.dispatchEvent(new CustomEvent("change", {
    //   detail: {
    //     flaggedCellsCount: this._flaggedCellsCount,
    //     checkedCellsCount: this._checkedCellsCount,
    //     boardState: this._state
    //   }
    // }));

    this._updateFlaggedCellsCount(e.detail.flaggedCellsCount);
  }

  _updateFlaggedCellsCount(count) {
    this.flaggedCounterDiv.innerHTML = this._config.minesNumber - (count || 0);
  }

  _updateTime(time) {
    this.timerDiv.innerHTML = (time || 0);
  }

  get config() {
    return this._config;
  }

  addEventListener(type, eventHandler) {
    eventHandler();
    var listener = new Object();
    listener.type = type;
    listener.eventHandler = eventHandler;
    this.eventListeners.push(listener);
  }

  dispatchEvent(event) {
    for (var i = 0; i < this.eventListeners.length; i++) {
      if (event.type == this.eventListeners[i].type)
        this.eventListeners[i].eventHandler(event);
    }
  }
}