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

  check(fieldId) {
    let field = this._getFieldById(fieldId);

    if (field.flagged) {
      return;
    }

    field.check();

    if (field.mined) {
      this._complete(false);
    }

    if (field.minedNeighborsNumber === 0 && !field.mined) {
      this._checkNeighbors(field);
    }

    if(!this._completed && this._areAllChecked()) {
      this._complete(true);
    }
  }

  /**
   * Set mine flag on the field with specified ID.
   * @param {string} fieldId 
   */
  toggle(fieldId) {
    let field = this._getFieldById(fieldId);
    field.toggleFlag();

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
        let field = this.matrix[x][y];
        if ((!field.mined && !field.checked)    // exists not checked empty cell
          || (field.mined && !field.flagged)) { // exists not flagged cell with mine
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
        let field = this.matrix[x][y];
        field.disable();
        if (field.mined) {
          field.reveal();
        }
      }
    }
  }

  /**
   * 
   * @param {Field} field
   */
  _checkNeighbors(field) {
    let neighborsFields = this._getNeighborsFields(field);
    for (let i = 0; i < neighborsFields.length; i++) {
      const currentField = neighborsFields[i];
      if (!currentField.checked && !currentField.mined && !currentField.flagged) {
        this.check(currentField.id);
      }
    }
  }

  /**
   * 
   * @param {Field} field
   */
  _getNeighborsFields(field) {
    let neighborsFields = [];
    for (let x = field.position.x == 0 ? 0 : field.position.x - 1; x <= field.position.x + 1 && x < this.config.rows; x++) {
      for (let y = field.position.y == 0 ? 0 : field.position.y - 1; y <= field.position.y + 1 && y < this.config.cols; y++) {
        const currentField = this.matrix[x][y];
        if (currentField.id !== field.id) {
          neighborsFields.push(currentField);
        }
      }
    }
    return neighborsFields;
  }

  /**
   * 
   */
  _setNeighborsMinesNumber() {
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let field = this.matrix[x][y];
        let neighborsFields = this._getNeighborsFields(field);
        let minedNeighborsNumber = neighborsFields.filter(f => f.mined).length || 0;
        if (!field.mined) {
          field.minedNeighborsNumber = minedNeighborsNumber;
        }
      }
    }
  }

  /**
   * 
   * @param {string} fieldId
   */
  _getFieldById(fieldId) {
    if (!fieldId) {
      throw 'Field ID is required';
    }

    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let field = this.matrix[x][y];
        if (field.id === fieldId) {
          return field;
        }
      }
    }

    throw `Field with specified id: ${fieldId} does not exists`;
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
    let fields = new Array(this.config.totalCount);
    for (let i = 0; i < fields.length; i++) {
      let fieldId = `f_${i}`;
      let mined = (i >= this.config.emptyCount);
      fields[i] = new Field(fieldId, mined);
    }

    fields = this._shuffleArray(fields);

    let fieldIndex = 0;
    for (let x = 0; x < this.matrix.length; x++) {
      for (let y = 0; y < this.matrix[x].length; y++) {
        let field = fields[fieldIndex++];
        field.position = new Position(x, y);
        this.matrix[x][y] = field;
      }
    }
  }
}