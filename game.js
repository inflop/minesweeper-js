"use strict";

class Game {
  constructor(config) {
    this._config = config;
  }

  create() {

    this.board = new Board(this._config);
    this.renderer = new BoardRenderer(this.board);
    this.renderer.refreshBoard();

    this.board.addEventListener('onComplete', this._onComplete, false);
  }

  _onComplete(e) {
    if (!e) return;

    console.log(e.detail);
    const state = e.detail.state;
    const msg = `You ${state === BoardState.EXPLODED ? 'lost' : 'won'}`;
    alert(msg);
  }

  get config() {
    return this._config;
  }
}