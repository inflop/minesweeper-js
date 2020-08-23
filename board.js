"use strict";

const BoardState = {
  UNMODIFIED: 0,
  MODIFIED: 1,
  DEMINED: 2,
  EXPLODED: 3
};

class Board {
  constructor(config) {
    if (!config) {
      throw 'The configuration is not set.';
    }

    this._config = config;
    this._state = BoardState.UNMODIFIED;

    this._flaggedCellsCount = 0;
    this._checkedCellsCount = 0;

    this._createMatrix();
    this._fillMatrix();
    this._setNeighborsMinesNumber();

    this._completed = false;
    this._eventListeners = [];
  }

  get state() {
    return this._state;
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
    this._updateBoardState();
    this._checkNeighbors(cell);
    this._onChange();
  }

  /**
   * Set mine flag on the cell with specified ID.
   * @param {string} cellId 
   */
  toggle(cellId) {
    let cell = this._getCellById(cellId);
    cell.toggleFlag();
    this._updateBoardState();
    this._onChange();
  }

  _complete() {
    this._completed = true;
    this._disableAndReveal();
    this.dispatchEvent(new CustomEvent("complete", {
      detail: {
        state: this._state
      }
    }));
  }

  get completed() {
    return this._completed;
  }

  _onChange() {
    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        flaggedCellsCount: this._flaggedCellsCount,
        checkedCellsCount: this._checkedCellsCount,
        boardState: this._state
      }
    }));
    if (this._state === BoardState.UNMODIFIED) {
      this._state = BoardState.MODIFIED;
    }
  }

  get flaggedCellsCount() {
    return this._flaggedCellsCount;
  }

  get checkedCellsCount() {
    return this._checkedCellsCount;
  }

  _updateBoardState() {
    if (this._completed) {
      return;
    }

    this._flaggedCellsCount = 0;
    this._checkedCellsCount = 0;

    let existsExplodedCell = false;
    let existsNotFlaggedMinedCell = false;
    let existsNotCheckedEmptyCell = false;

    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let cell = this.matrix[x][y];

        cell.flagged && this._flaggedCellsCount++;
        cell.checked && this._checkedCellsCount++;

        if (cell.exploded) {
          existsExplodedCell = true;
        }

        if (cell.mined && !cell.flagged) {
          existsNotFlaggedMinedCell = true;
        }

        if (!cell.mined && !cell.checked) {
          existsNotCheckedEmptyCell = true;
        }
      }
    }

    if (existsExplodedCell) {
      this._state = BoardState.EXPLODED;
    }

    if (!existsNotFlaggedMinedCell && !existsNotCheckedEmptyCell) {
      this._state = BoardState.DEMINED;
    }

    if (this._state === BoardState.EXPLODED || this._state === BoardState.DEMINED) {
      this._complete();
    }
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

  /**
   * 
   * @param {Cell} cell
   */
  _getNeighborsCells(cell) {
    let neighborsCells = [];
    for (let x = cell.position.x == 0 ? 0 : cell.position.x - 1; x <= cell.position.x + 1 && x < this._config.rows; x++) {
      for (let y = cell.position.y == 0 ? 0 : cell.position.y - 1; y <= cell.position.y + 1 && y < this._config.cols; y++) {
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
    this.matrix = new Array(this._config.rows);
    for (let i = 0; i < this.matrix.length; i++) {
      this.matrix[i] = new Array(this._config.cols);
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
    let cells = new Array(this._config.totalNumber);
    for (let i = 0; i < cells.length; i++) {
      let cellId = `f_${i}`;
      let mined = (i >= this._config.emptyNumber);
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