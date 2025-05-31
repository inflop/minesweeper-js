"use strict";

import { BoardState } from './states.js';
import { GameResult } from './states.js';
import { EventManager } from './event-manager.js';

export class Game {
  constructor(config, board, boardRenderer, gameState) {
    this._config = config;
    this._board = board;
    this._boardRenderer = boardRenderer;
    this._gameState = gameState;
    this._eventManager = new EventManager();
  }

  new() {
    this._boardRenderer.refreshBoard();
    this._board.addEventListener('change', this._change.bind(this));
    this._gameState.reset();
  }

  _change(e) {
    if (!this._gameState.isStarted && e.detail.boardState === BoardState.MODIFIED) {
      this._gameState.start();
      this.dispatchEvent(new CustomEvent("start"));
    }

    this._updateResultFromBoardState(e.detail.boardState);

    this._gameState.updateCounts(
      e.detail.flaggedCellsCount,
      e.detail.checkedCellsCount,
      this._config.minesNumber - e.detail.flaggedCellsCount
    );

    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        flaggedCellsCount: this._gameState.flaggedCellsCount,
        checkedCellsCount: this._gameState.checkedCellsCount,
        flaggedMinesCount: this._gameState.flaggedMinesCount,
        result: this._gameState.result
      }
    }));

    if (this._gameState.isCompleted) {
      this.dispatchEvent(new CustomEvent("end", {
        detail: {
          result: this._gameState.result
        }
      }));
    }
  }

  _updateResultFromBoardState(boardState) {
    switch (boardState) {
      case BoardState.DEMINED:
        this._gameState.complete(GameResult.WON);
        break;
      case BoardState.EXPLODED:
        this._gameState.complete(GameResult.LOST);
        break;
      default:
        break;
    }
  }

  get config() {
    return this._config;
  }

  addEventListener(type, eventHandler) {
    this._eventManager.addEventListener(type, eventHandler);
  }

  dispatchEvent(event) {
    this._eventManager.dispatchEvent(event);
  }
}