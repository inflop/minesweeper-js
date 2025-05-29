"use strict";

class Board {
  constructor(config, boardGenerator, boardStateManager) {
    if (!config) {
      throw new Error('The configuration is not set.');
    }

    this._config = config;
    this._boardGenerator = boardGenerator;
    this._boardStateManager = boardStateManager;
    this._eventListeners = [];

    this._matrix = this._boardGenerator.generateBoard(config);
  }

  get matrix() {
    return this._matrix;
  }

  get state() {
    return this._boardStateManager.state;
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

  check(cellId) {
    let cell = this._getCellById(cellId);

    if (cell.flagged) {
      return;
    }

    cell.check();
    this._checkNeighbors(cell);
    this._onChange();
  }

  toggle(cellId) {
    let cell = this._getCellById(cellId);
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
        let cell = this._matrix[x][y];
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

    let neighborsCells = this._getNeighborsCells(cell);

    for (let i = 0; i < neighborsCells.length; i++) {
      const currentCell = neighborsCells[i];
      if (!currentCell.checked && !currentCell.mined && !currentCell.flagged) {
        this.check(currentCell.id);
      }
    }
  }

  _getNeighborsCells(cell) {
    let neighborsCells = [];
    for (let x = cell.position.x == 0 ? 0 : cell.position.x - 1;
         x <= cell.position.x + 1 && x < this._config.rows; x++) {
      for (let y = cell.position.y == 0 ? 0 : cell.position.y - 1;
           y <= cell.position.y + 1 && y < this._config.cols; y++) {
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
        let cell = this._matrix[x][y];
        if (cell.id === cellId) {
          return cell;
        }
      }
    }

    throw new Error(`The cell with specified id: ${cellId} does not exists`);
  }
}