class Board {
  constructor(rows, cols, minesPercentage) {
    if ((rows || 0) === 0) {
      throw 'The number of rows must be greater than zero';
    }

    if ((cols || 0) === 0) {
      throw 'The number of columns must be greater than zero';
    }

    if ((minesPercentage || 0) === 0) {
      throw 'The percentage of mines must be greater than zero';
    }

    this.rows = rows;
    this.cols = cols;
    this.minesPercentage = minesPercentage;

    this.totalCount = this.rows * this.cols;
    this.minesCount = Math.round(this.totalCount * (this.minesPercentage / 100));
    this.emptyCount = this.totalCount - this.minesCount;

    this._createMatrix();
    this._fillMatrix();
    this._setNeighborsMinesNumber();
  }

  check(fieldId) {
    let field = this._getFieldById(fieldId);

    field.check();

    if (field.mined) {
      this._disableAndReveal();
      throw new CheckedMinedFieldError(fieldId);
    }

    if (field.minedNeighborsNumber === 0) {
      this._checkNeighbors(field);
    }
  }

  /**
   * Set mine flag on the field with specified ID.
   * @param {string} fieldId 
   */
  toggle(fieldId) {
    let field = this._getFieldById(fieldId);
    field.toggleFlag();
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
    for (let x = field.position.x == 0 ? 0 : field.position.x - 1; x <= field.position.x + 1 && x < this.rows; x++) {
      for (let y = field.position.y == 0 ? 0 : field.position.y - 1; y <= field.position.y + 1 && y < this.cols; y++) {
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
    this.matrix = new Array(this.rows);
    for (let i = 0; i < this.matrix.length; i++) {
      this.matrix[i] = new Array(this.cols);
    }
  }

  _shfuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  }

  _fillMatrix() {
    let fields = new Array(this.totalCount);
    for (let i = 0; i < fields.length; i++) {
      let fieldId = `f_${i}`;
      let mined = (i >= this.emptyCount);
      fields[i] = new Field(fieldId, mined);
    }

    fields = this._shfuffleArray(fields);

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