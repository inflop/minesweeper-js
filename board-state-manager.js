"use strict";

import { BoardState } from './states.js';

export class BoardStateManager {
  constructor(config) {
    if (!config) {
      throw new Error('Configuration is required');
    }
    this._config = config;
    this._state = BoardState.UNMODIFIED;
    this._flaggedCellsCount = 0;
    this._checkedCellsCount = 0;
  }

  get state() {
    return this._state;
  }

  get flaggedCellsCount() {
    return this._flaggedCellsCount;
  }

  get checkedCellsCount() {
    return this._checkedCellsCount;
  }

  updateState(matrix) {
    if (!matrix || !Array.isArray(matrix)) {
      throw new Error('Valid matrix is required');
    }

    this._flaggedCellsCount = 0;
    this._checkedCellsCount = 0;

    const cellStates = this._analyzeCells(matrix);
    this._updateBoardState(cellStates);

    return {
      state: this._state,
      flaggedCellsCount: this._flaggedCellsCount,
      checkedCellsCount: this._checkedCellsCount
    };
  }

  _analyzeCells(matrix) {
    let existsExplodedCell = false;
    let existsNotFlaggedMinedCell = false;
    let existsNotCheckedEmptyCell = false;

    for (const element of matrix) {
      for (const cell of element) {
        this._updateCellCounts(cell);

        if (cell.exploded) {
          existsExplodedCell = true;
        }

        if (cell.isMined && !cell.flagged) {
          existsNotFlaggedMinedCell = true;
        }

        if (!cell.isMined && !cell.checked) {
          existsNotCheckedEmptyCell = true;
        }
      }
    }

    return {
      existsExplodedCell,
      existsNotFlaggedMinedCell,
      existsNotCheckedEmptyCell
    };
  }

  _updateCellCounts(cell) {
    if (cell.flagged) this._flaggedCellsCount++;
    if (cell.checked) this._checkedCellsCount++;
  }

  _updateBoardState(cellStates) {
    if (cellStates.existsExplodedCell) {
      this._state = BoardState.EXPLODED;
    } else if (!cellStates.existsNotFlaggedMinedCell && !cellStates.existsNotCheckedEmptyCell) {
      this._state = BoardState.DEMINED;
    } else if (this._state === BoardState.UNMODIFIED) {
      this._state = BoardState.MODIFIED;
    }
  }

  reset() {
    this._state = BoardState.UNMODIFIED;
    this._flaggedCellsCount = 0;
    this._checkedCellsCount = 0;
  }
}