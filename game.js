"use strict";

const GameResult = {
  NONE: 0,
  WON: 1,
  LOST: 2
};

class Game {
  constructor(config) {
    this._config = config;
    this.eventListeners = [];
  }

  new() {
    this.board = new Board(this._config);
    this.renderer = new BoardRenderer(this.board);
    this.renderer.refreshBoard();

    this.board.addEventListener('change', this._change.bind(this), false);
    this._result = GameResult.NONE;
  }

  _change(e) {
    if (e.detail.boardState === BoardState.UNMODIFIED) {
      this.dispatchEvent(new CustomEvent("start"));
    }

    this._updateResultFromBoardState(e.detail.boardState);

    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        flaggedCellsCount: e.detail.flaggedCellsCount,
        checkedCellsCount: e.detail.checkedCellsCount,
        flaggedMinesCount: this._config.minesNumber - e.detail.flaggedCellsCount,
        result: this._result
      }
    }));

    const isEnd = (this._result === GameResult.LOST || this._result === GameResult.WON);
    isEnd && this.dispatchEvent(new CustomEvent("end", {
      detail: {
        result: this._result
      }
    }));
  }

  _updateResultFromBoardState(boardState) {
    switch (boardState) {
      case BoardState.DEMINED:
        this._result = GameResult.WON;
        break;
      case BoardState.EXPLODED:
        this._result = GameResult.LOST;
        break;
      default:
        this._result = GameResult.NONE;
        break;
    }
  }

  get config() {
    return this._config;
  }

  addEventListener(type, eventHandler) {
    this.eventListeners.push({
      type,
      eventHandler
    });
  }

  dispatchEvent(event) {
    for (let i = 0; i < this.eventListeners.length; i++) {
      if (event.type == this.eventListeners[i].type)
        this.eventListeners[i].eventHandler(event);
    }
  }
}