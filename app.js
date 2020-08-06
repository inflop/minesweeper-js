document.addEventListener('DOMContentLoaded', (event) => {
    const rows = 5;
    const cols = 5;
    const minesPercent = 50;
    let board = new Board(rows, cols, minesPercent);
    console.log(board);
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

        this._createFieldsMatrix();
    }

    _createFieldsMatrix() {
        let fields = new Array(this.totalCount);
        for (let i = 0; i < fields.length; i++) {
            let fieldId = `f_${i}`;
            let mined = (i >= this.emptyCount);
            fields[i] = new Field(fieldId, mined);
        }

        //console.log(fields);

        fields.sort(() => Math.random() - 0.5);

        this.matrix = new Array(this.rows);
        for (let i = 0; i < this.matrix.length; i++) {
            this.matrix[i] = new Array(this.cols);
            for (let j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j] = fields[i+j];
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
        this.isMarked = false;
        this.clicked = false;
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