"use strict";

import { Cell } from './cell.js';
import { Position } from './position.js';

export class BoardGenerator {
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
    this._matrix = Array.from({ length: config.rows }, () => new Array(config.cols));
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  _fillMatrix(config) {
    const cells = Array.from({ length: config.totalNumber }, (_, i) => {
      const cellId = `f_${i}`;
      const mined = i >= config.emptyNumber;
      return new Cell(cellId, mined);
    });

    const shuffledCells = this._shuffleArray(cells);

    let cellIndex = 0;
    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        const cell = shuffledCells[cellIndex++];
        cell.position = new Position(x, y);
        this._matrix[x][y] = cell;
      }
    }
  }

  _getNeighborsCells(cell, config) {
    const neighborsCells = [];
    const startX = Math.max(0, cell.position.x - 1);
    const startY = Math.max(0, cell.position.y - 1);
    const endX = Math.min(cell.position.x + 1, config.rows - 1);
    const endY = Math.min(cell.position.y + 1, config.cols - 1);

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

  _setNeighborsMinesNumber(config) {
    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        const cell = this._matrix[x][y];
        const neighborsCells = this._getNeighborsCells(cell, config);
        const minedNeighborsNumber = neighborsCells.filter(cell => cell.mined).length;
        if (!cell.mined) {
          cell.minedNeighborsNumber = minedNeighborsNumber;
        }
      }
    }
  }
}