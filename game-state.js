"use strict";

class GameState {
  constructor() {
    this._state = {
      isStarted: false,
      isCompleted: false,
      result: null,
      flaggedCellsCount: 0,
      checkedCellsCount: 0,
      flaggedMinesCount: 0,
      timeElapsed: 0
    };
  }

  get isStarted() {
    return this._state.isStarted;
  }

  get isCompleted() {
    return this._state.isCompleted;
  }

  get result() {
    return this._state.result;
  }

  get flaggedCellsCount() {
    return this._state.flaggedCellsCount;
  }

  get checkedCellsCount() {
    return this._state.checkedCellsCount;
  }

  get flaggedMinesCount() {
    return this._state.flaggedMinesCount;
  }

  get timeElapsed() {
    return this._state.timeElapsed;
  }

  start() {
    this._state.isStarted = true;
    this._state.timeElapsed = 0;
  }

  complete(result) {
    this._state.isCompleted = true;
    this._state.result = result;
  }

  updateCounts(flaggedCells, checkedCells, flaggedMines) {
    this._state.flaggedCellsCount = flaggedCells;
    this._state.checkedCellsCount = checkedCells;
    this._state.flaggedMinesCount = flaggedMines;
  }

  updateTime(seconds) {
    this._state.timeElapsed = seconds;
  }

  reset() {
    this._state = {
      isStarted: false,
      isCompleted: false,
      result: null,
      flaggedCellsCount: 0,
      checkedCellsCount: 0,
      flaggedMinesCount: 0,
      timeElapsed: 0
    };
  }
}