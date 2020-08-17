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
    this._clear();

    this.board.addEventListener('onComplete', this._onComplete, false);

    self = this;
  }

  _onComplete(e) {
    if (!e) return;

    const state = e.detail.state;
    const msg = `You ${state === BoardState.EXPLODED ? 'lost' : 'won'}`;
    const color = (state === BoardState.EXPLODED ? 'red' : 'green');
    //alert(msg);
    self.resultDiv.innerHTML = msg;
    self.resultDiv.style.color = color;
  }

  _clear() {
    this.resultDiv.innerHTML = '';
  }

  get config() {
    return this._config;
  }
}