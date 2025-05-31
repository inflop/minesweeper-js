"use strict";

export class Cell {
  constructor(id, isMined) {
    if (!id) {
      throw new Error("The cell's ID is required");
    }

    this.id = id;
    this.isMined = !!isMined;

    this._initializeDefaults();
  }

  _initializeDefaults() {
    this._minedNeighborsNumber = 0;
    this._isFlagged = false;
    this._isChecked = false;
    this._isDisabled = false;
    this._isRevealed = false;
    this._position = null;
  }

  set position(position) {
    this._position = position;
  }

  get position() {
    return this._position;
  }

  get hasMinedNeighbors() {
    return (this._minedNeighborsNumber || 0) > 0;
  }

  get disabled() {
    return this._isDisabled;
  }

  disable() {
    this._isDisabled = true;
  }

  set minedNeighborsNumber(value) {
    if (this.isMined) {
      throw new Error('Cannot set the mined neighbors number on mined cell.');
    }

    this._minedNeighborsNumber = value || 0;
  }

  get minedNeighborsNumber() {
    return this._minedNeighborsNumber;
  }

  toggleFlag() {
    if (this._isDisabled) {
      throw new Error(`Cannot ${this._isFlagged ? 'unflag' : 'flag'} disabled cell: '${this.id}'`);
    }
    if (this._isRevealed) {
      throw new Error(`Cannot ${this._isFlagged ? 'unflag' : 'flag'} revealed cell: '${this.id}'`);
    }
    if (this._isChecked) {
      throw new Error(`Cannot ${this._isFlagged ? 'unflag' : 'flag'} checked cell: '${this.id}'`);
    }
    this._isFlagged = !this._isFlagged;
  }

  get flagged() {
    return this._isFlagged;
  }

  get exploded() {
    return this.isMined && this.checked;
  }

  get checked() {
    return this._isChecked;
  }

  check() {
    if (this._isDisabled) {
      throw new Error(`Cannot check disabled cell: '${this.id}'`);
    }

    if (this._isRevealed) {
      throw new Error(`Cannot check revealed cell: '${this.id}'`);
    }

    if (this._isChecked) {
      throw new Error(`The cell with: '${this.id}' is already checked`);
    }

    if (this._isFlagged) {
      throw new Error(`Cannot check flagged cell: '${this.id}'`);
    }

    this._isChecked = true;
  }

  get revealed() {
    return this._isRevealed;
  }

  reveal() {
    if (!this.isMined) return;
    if (this._isRevealed) return;
    this.disable();
    this._isRevealed = true;
  }
}