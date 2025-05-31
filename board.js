"use strict";

import { BoardState } from './states.js';
import { EventManager } from './event-manager.js';

export class Board {
  constructor(config, boardGenerator, boardStateManager) {
    if (!config) {
      throw new Error('The configuration is not set.');
    }

    this._config = config;
    this._boardGenerator = boardGenerator;
    this._boardStateManager = boardStateManager;
    this._matrix = [];
    this._eventManager = new EventManager();

    this._matrix = this._boardGenerator.generateBoard(config);
  }

  get matrix() {
    return this._matrix;
  }

  get state() {
    return this._boardStateManager.state;
  }

  addEventListener(type, eventHandler) {
    this._eventManager.addEventListener(type, eventHandler);
  }

  dispatchEvent(event) {
    this._eventManager.dispatchEvent(event);
  }

  check(cellId) {
    const cell = this._getCellById(cellId);

    if (cell.flagged) {
      return;
    }

    cell.check();
    this._checkNeighbors(cell);
    this._onChange();
  }

  toggle(cellId) {
    const cell = this._getCellById(cellId);
    cell.toggleFlag();
    this._onChange();
  }

  _onChange() {
    const state = this._boardStateManager.updateState(this._matrix);

    if (state.state === BoardState.EXPLODED || state.state === BoardState.DEMINED) {
      this._disableAndReveal();
    }

    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        flaggedCellsCount: state.flaggedCellsCount,
        checkedCellsCount: state.checkedCellsCount,
        boardState: state.state
      }
    }));
  }

  _disableAndReveal() {
    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        const cell = this._matrix[x][y];
        cell.disable();
        if (cell.mined) {
          cell.reveal();
        }
      }
    }
  }

  _checkNeighbors(cell) {
    if (cell.hasMinedNeighbors || cell.mined) {
      return;
    }

    const neighborsCells = this._getNeighborsCells(cell);

    for (const currentCell of neighborsCells) {
      if (!currentCell.checked && !currentCell.mined && !currentCell.flagged) {
        this.check(currentCell.id);
      }
    }
  }

  _getNeighborsCells(cell) {
    const neighborsCells = [];
    const startX = cell.position.x === 0 ? 0 : cell.position.x - 1;
    const startY = cell.position.y === 0 ? 0 : cell.position.y - 1;
    const endX = Math.min(cell.position.x + 1, this._config.rows - 1);
    const endY = Math.min(cell.position.y + 1, this._config.cols - 1);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const currentCell = this._matrix[x][y];
        if (currentCell.id !== cell.id) {
          neighborsCells.push(currentCell);
        }
      }
    }
    return neighborsCells;
  }

  _getCellById(cellId) {
    if (!cellId) {
      throw new Error('The cell ID is required');
    }

    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        const cell = this._matrix[x][y];
        if (cell.id === cellId) {
          return cell;
        }
      }
    }

    throw new Error(`The cell with specified id: ${cellId} does not exists`);
  }
}