"use strict";

export class Cell {
  constructor(id, mined) {
    if (!id) {
      throw new Error("The cell's ID is required");
    }

    this.id = id;
    this.mined = !!mined;

    this._initializeDefaults();
  }

  _initializeDefaults() {
    this._minedNeighborsNumber = 0;
    this._flagged = false;
    this._checked = false;
    this._disabled = false;
    this._revealed = false;
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
    return this._disabled;
  }

  disable() {
    this._disabled = true;
  }

  set minedNeighborsNumber(value) {
    if (this.mined) {
      throw new Error('Cannot set the mined neighbors number on mined cell.');
    }

    this._minedNeighborsNumber = value || 0;
  }

  get minedNeighborsNumber() {
    return this._minedNeighborsNumber;
  }

  toggleFlag() {
    if (this._disabled) {
      throw new Error(`Cannot ${this._flagged ? 'unflag' : 'flag'} disabled cell: '${this.id}'`);
    }
    if (this._revealed) {
      throw new Error(`Cannot ${this._flagged ? 'unflag' : 'flag'} revealed cell: '${this.id}'`);
    }
    if (this._checked) {
      throw new Error(`Cannot ${this._flagged ? 'unflag' : 'flag'} checked cell: '${this.id}'`);
    }
    this._flagged = !this._flagged;
  }

  get flagged() {
    return this._flagged;
  }

  get exploded() {
    return this.mined && this.checked;
  }

  get checked() {
    return this._checked;
  }

  check() {
    if (this._disabled) {
      throw new Error(`Cannot check disabled cell: '${this.id}'`);
    }

    if (this._revealed) {
      throw new Error(`Cannot check revealed cell: '${this.id}'`);
    }

    if (this._checked) {
      throw new Error(`The cell with: '${this.id}' is already checked`);
    }

    if (this._flagged) {
      throw new Error(`Cannot check flagged cell: '${this.id}'`);
    }

    this._checked = true;
  }

  get revealed() {
    return this._revealed;
  }

  reveal() {
    if (!this.mined) return;
    if (this._revealed) return;
    this.disable();
    this._revealed = true;
  }
}