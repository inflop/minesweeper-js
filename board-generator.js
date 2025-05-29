"use strict";

class BoardGenerator {
  constructor() {
    this._matrix = [];
  }

  generateBoard(config) {
    if (!config) {
      throw new Error('Configuration is required');
    }

    this._createMatrix(config);
    this._fillMatrix(config);
    this._setNeighborsMinesNumber(config);
    return this._matrix;
  }

  _createMatrix(config) {
    this._matrix = new Array(config.rows);
    for (let i = 0; i < this._matrix.length; i++) {
      this._matrix[i] = new Array(config.cols);
    }
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  _fillMatrix(config) {
    let cells = new Array(config.totalNumber);
    for (let i = 0; i < cells.length; i++) {
      let cellId = `f_${i}`;
      let mined = (i >= config.emptyNumber);
      cells[i] = new Cell(cellId, mined);
    }

    cells = this._shuffleArray(cells);

    let cellIndex = 0;
    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        let cell = cells[cellIndex++];
        cell.position = new Position(x, y);
        this._matrix[x][y] = cell;
      }
    }
  }

  _getNeighborsCells(cell, config) {
    let neighborsCells = [];
    for (let x = Math.max(0, cell.position.x - 1);
         x <= Math.min(cell.position.x + 1, config.rows - 1); x++) {
      for (let y = Math.max(0, cell.position.y - 1);
           y <= Math.min(cell.position.y + 1, config.cols - 1); y++) {
        const currentCell = this._matrix[x][y];
        if (currentCell.id !== cell.id) {
          neighborsCells.push(currentCell);
        }
      }
    }
    return neighborsCells;
  }

  _setNeighborsMinesNumber(config) {
    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        let cell = this._matrix[x][y];
        let neighborsCells = this._getNeighborsCells(cell, config);
        let minedNeighborsNumber = neighborsCells.filter(f => f.mined).length || 0;
        if (!cell.mined) {
          cell.minedNeighborsNumber = minedNeighborsNumber;
        }
      }
    }
  }
}