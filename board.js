"use strict";

class Board {
  constructor(config) {
    if (!config) {
      throw 'The configuration is not set.';
    }

    this.config = config;

    this._createMatrix();
    this._fillMatrix();
    this._setNeighborsMinesNumber();

    this._completed = false;
    this.eventListeners = [];
  }

  addEventListener(type, eventHandler) {
    eventHandler();
    var listener = new Object();
    listener.type = type;
    listener.eventHandler = eventHandler;
    this.eventListeners.push(listener);
  }

  dispatchEvent(event) {
    for (var i = 0; i < this.eventListeners.length; i++) {
      if (event.type == this.eventListeners[i].type)
        this.eventListeners[i].eventHandler(event);
    }
  }

  check(cellId) {
    let cell = this._getCellById(cellId);

    if (cell.flagged) {
      return;
    }

    cell.check();

    if (cell.mined) {
      this._complete(false);
    }

    if (cell.minedNeighborsNumber === 0 && !cell.mined) {
      this._checkNeighbors(cell);
    }

    if(!this._completed && this._areAllChecked()) {
      this._complete(true);
    }
  }

  /**
   * Set mine flag on the cell with specified ID.
   * @param {string} cellId 
   */
  toggle(cellId) {
    let cell = this._getCellById(cellId);
    cell.toggleFlag();

    if(!this._completed && this._areAllChecked()) {
      this._complete(true);
    }
  }

  _complete(result) {
    this._completed = true;
    this._disableAndReveal();
    this.dispatchEvent(new CustomEvent("onComplete", { detail: { result: result }}));
  }

  get completed() {
    return this._completed;
  }

  _areAllChecked() {
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let cell = this.matrix[x][y];
        if ((!cell.mined && !cell.checked)    // exists not checked empty cell
          || (cell.mined && !cell.flagged)) { // exists not flagged cell with mine
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Reveals and displays all mines.
   */
  _disableAndReveal() {
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let cell = this.matrix[x][y];
        cell.disable();
        if (cell.mined) {
          cell.reveal();
        }
      }
    }
  }

  /**
   * 
   * @param {Cell} cell
   */
  _checkNeighbors(cell) {
    let neighborsCells = this._getNeighborsCells(cell);
    for (let i = 0; i < neighborsCells.length; i++) {
      const currentCell = neighborsCells[i];
      if (!currentCell.checked && !currentCell.mined && !currentCell.flagged) {
        this.check(currentCell.id);
      }
    }
  }

  /**
   * 
   * @param {Cell} cell
   */
  _getNeighborsCells(cell) {
    let neighborsCells = [];
    for (let x = cell.position.x == 0 ? 0 : cell.position.x - 1; x <= cell.position.x + 1 && x < this.config.rows; x++) {
      for (let y = cell.position.y == 0 ? 0 : cell.position.y - 1; y <= cell.position.y + 1 && y < this.config.cols; y++) {
        const currentCell = this.matrix[x][y];
        if (currentCell.id !== cell.id) {
          neighborsCells.push(currentCell);
        }
      }
    }
    return neighborsCells;
  }

  /**
   * 
   */
  _setNeighborsMinesNumber() {
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let cell = this.matrix[x][y];
        let neighborsCells = this._getNeighborsCells(cell);
        let minedNeighborsNumber = neighborsCells.filter(f => f.mined).length || 0;
        if (!cell.mined) {
          cell.minedNeighborsNumber = minedNeighborsNumber;
        }
      }
    }
  }

  /**
   * 
   * @param {string} cellId
   */
  _getCellById(cellId) {
    if (!cellId) {
      throw 'The cell ID is required';
    }

    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let cell = this.matrix[x][y];
        if (cell.id === cellId) {
          return cell;
        }
      }
    }

    throw `The cell with specified id: ${cellId} does not exists`;
  }

  _createMatrix() {
    this.matrix = new Array(this.config.rows);
    for (let i = 0; i < this.matrix.length; i++) {
      this.matrix[i] = new Array(this.config.cols);
    }
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  }

  _fillMatrix() {
    let cells = new Array(this.config.totalCount);
    for (let i = 0; i < cells.length; i++) {
      let cellId = `f_${i}`;
      let mined = (i >= this.config.emptyCount);
      cells[i] = new Cell(cellId, mined);
    }

    cells = this._shuffleArray(cells);

    let cellIndex = 0;
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let cell = cells[cellIndex++];
        cell.position = new Position(x, y);
        this.matrix[x][y] = cell;
      }
    }
  }
}