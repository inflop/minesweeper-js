"use strict";

class Cell {
  constructor(id, mined) {
    if (!id) {
      throw "The cell's ID is required";
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
      throw 'Cannot set the mined neighbors number on mined cell.';
    }

    this._minedNeighborsNumber = value || 0;
  }

  get minedNeighborsNumber() {
    return this._minedNeighborsNumber;
  }

  toggleFlag() {
    if (!this._flagged) {

      if (this._disabled) {
        throw `Cannot flag disabled cell: '${this.id}'`;
      }

      if (this._revealed) {
        throw `Cannot flag revealed cell: '${this.id}'`;
      }

      if (this._checked) {
        throw `Cannot flag checked cell: '${this.id}'`;
      }
    } else {
      if (this._disabled) {
        throw `Cannot unflag disabled cell: '${this.id}'`;
      }

      if (this._revealed) {
        throw `Cannot unflag revealed cell: '${this.id}'`;
      }

      if (this._checked) {
        throw `Cannot unflag checked cell: '${this.id}'`;
      }
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
      throw `Cannot check disabled cell: '${this.id}'`;
    }

    if (this._revealed) {
      throw `Cannot check revealed cell: '${this.id}'`;
    }

    if (this._checked) {
      throw `The cell with: '${this.id}' is already checked`;
    }

    if (this._flagged) {
      throw `Cannot check flagged cell: '${this.id}'`;
    }

    this._checked = true;
  }

  get revealed() {
    return this._revealed;
  }

  reveal() {
    if (!this.mined) {
      throw `Only mined cells can be revealed`;
    }

    this.disable();
    this._revealed = true;
  }
}