"use strict";

const GameResult = {
  NONE: -1,
  LOSE: 0,
  WIN: 1
};

class Game {
  constructor(config) {
    this._config = config;
    this.result = GameResult.NONE;
  }

  create() {

    this.board = new Board(this._config);
    this.renderer = new BoardRenderer(this.board);
    this.renderer.refreshBoard();

    this.board.addEventListener('onComplete', this._onComplete, false);
  }

  _onComplete(e) {
    if (!e) return;

    console.log(e);
    const result = e.detail.result;
    const msg = `You ${result ? 'won' : 'lost'}`;
    alert(msg);
    //this.create();
  }

  get config() {
    return this._config;
  }

  onComplete
}