"use strict";

class Config {
  constructor(rows, cols, minesPercentage) {
    if ((rows || 0) < 5) {
      throw 'The number of rows must be greater than 5';
    }

    if ((cols || 0) < 5) {
      throw 'The number of columns must be greater than 5';
    }

    if ((minesPercentage || 0) === 0) {
      throw 'The percentage of mines must be greater than zero';
    }

    this._rows = rows;
    this._cols = cols;
    this._minesPercentage = minesPercentage;

    this._totalNumber = this._rows * this._cols;
    this._minesNumber = Math.round(this._totalNumber * (this._minesPercentage / 100));
    this._emptyNumber = this._totalNumber - this._minesNumber;
  }

  get rows() {
    return this._rows;
  }

  get cols() {
    return this._cols;
  }

  get minesPercentage() {
    return this._minesPercentage;
  }

  get totalNumber() {
    return this._totalNumber;
  }

  get minesNumber() {
    return this._minesNumber;
  }

  get emptyNumber() {
    return this._emptyNumber;
  }
}