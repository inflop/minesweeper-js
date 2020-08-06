document.addEventListener('DOMContentLoaded', (event) => {
    const rows = 5;
    const cols = 5;
    const minesPercent = 20;
    let board = new Board(rows, cols, minesPercent);
    console.log(board);
    board._click('f_2');
});

class Board {
    constructor(rows, cols, minesPercent) {
        if ((rows || 0) === 0) {
            throw 'Rows count must be greater than zero';
        }

        if ((cols || 0) === 0) {
            throw 'Columns count must be greater than zero';
        }

        if ((minesPercent || 0) === 0) {
            throw 'Mines percent count must be greater than zero';
        }

        this.rows = rows;
        this.cols = cols;
        this.minesPercent = minesPercent;

        this.totalCount = this.rows * this.cols;
        this.minesCount = Math.round(this.totalCount * (this.minesPercent / 100));
        this.emptyCount = this.totalCount - this.minesCount;

        this._createMatrix();
        this._fillMatrix();
    }

    _click(id) {
        let field = this._searchFieldById(id);
        field.click();
        let neighborsFields = this._getNeighborsFields(field);
        console.log(field);
        console.log(neighborsFields);
    }

    _getNeighborsFields(field) {
        let neighborsFields = [];
        for(let rowIndex = field.rowIndex == 0 ? 0 : field.rowIndex - 1; rowIndex <= field.rowIndex + 1 && rowIndex < this.rows; rowIndex++) {
            for(let colIndex = field.colIndex == 0 ? 0 : field.colIndex - 1; colIndex <= field.colIndex + 1 && colIndex < this.cols; colIndex++) {
                const currentField = this.matrix[rowIndex][colIndex];
                if (currentField.id !== field.id) {
                    neighborsFields.push(currentField);
                }
            }
        }
        return neighborsFields;
    }

    _searchFieldById(id) {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                let field = this.matrix[i][j];
                if (field.id === id) {
                    return field;
                }
            }
        }

        throw `Field with specified id: ${id} does not exists`;
    }

    _createMatrix() {
        this.matrix = new Array(this.rows);
        for (let i = 0; i < this.matrix.length; i++) {
            this.matrix[i] = new Array(this.cols);
        }
    }

    _fillMatrix() {
        let fields = new Array(this.totalCount);
        for (let i = 0; i < fields.length; i++) {
            let fieldId = `f_${i}`;
            let mined = (i >= this.emptyCount);
            fields[i] = new Field(fieldId, mined);
        }
        fields = fields.sort(() => Math.random() - 0.5);

        let fieldIndex = 0;
        for (let rowIndex = 0; rowIndex < this.matrix.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.matrix[rowIndex].length; colIndex++) {
                let field = fields[fieldIndex++];
                field.setRowIndex(rowIndex);
                field.setColIndex(colIndex);
                this.matrix[rowIndex][colIndex] = field;
            }
        }
    }
}

class Field {
    constructor(id, mined) {
        if (!id) {
            throw 'Field ID is required';
        }

        this.id = id;
        this.mined = !!mined;

        this.initializeDefaults();
    }

    initializeDefaults() {
        this.rowIndex = 0;
        this.colIndex = 0;
        this.isMarked = false;
        this.clicked = false;
        this.minedNeighborsNumber = 0;
    }

    setRowIndex(rowIndex) {
        if (isNaN(rowIndex)) {
            throw 'Row index must be a number';
        }

        this.rowIndex = rowIndex;
    }

    setColIndex(colIndex) {
        if (isNaN(colIndex)) {
            throw 'Column index must be a number';
        }

        this.colIndex = colIndex;
    }

    setMinedNeighborsNumber(minedNeighborsNumber) {
        if (!this.clicked) {
            throw "The field isn't clicked yet. Cannot set the mined neighbors number.";
        }

        // if (this.mined) {
        //     throw 'Cannot set the mined neighbors count on mined field.';
        // }

        this.minedNeighborsNumber = minedNeighborsNumber || 0;
    }

    mark() {
        if (this.clicked) {
            throw 'Cannot mark clicked field.';
        }

        if (!this.isMarked) {
            throw 'The field is already marked.';
        }

        this.isMarked = true;
    }

    unmark() {
        if (this.clicked) {
            throw 'Cannot unmark clicked field.';
        }

        if (!this.isMarked) {
            throw 'The field is already unmarked.';
        }

        this.isMarked = false;
    }

    click() {
        if (this.clicked) {
            throw 'The field is already clicked.';
        }

        if (this.isMarked) {
            throw 'Cannot click marked field.';
        }

        this.clicked = true;
    }

    isMined() {
        return this.mined;
    }
}