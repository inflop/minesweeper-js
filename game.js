"use strict";

const GameResult = {
  NONE: 0,
  WON: 1,
  LOST: 2
};

class Game {
  constructor(config, board, boardRenderer) {
    this._config = config;
    this._board = board;
    this._boardRenderer = boardRenderer;
    this._eventListeners = [];
  }

  new() {
    this._boardRenderer.refreshBoard();
    this._board.addEventListener('change', this._change.bind(this), false);
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
    this._eventListeners.push({
      type,
      eventHandler
    });
  }

  dispatchEvent(event) {
    for (let i = 0; i < this._eventListeners.length; i++) {
      if (event.type == this._eventListeners[i].type)
        this._eventListeners[i].eventHandler(event);
    }
  }
}