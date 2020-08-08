document.addEventListener('DOMContentLoaded', (event) => {
    const rows = 4;
    const cols = 4;
    const minesPercent = 10;
    let board = new Board(rows, cols, minesPercent);

    const createNew = () => {
        const renderer = new BoardRenderer(board);
        renderer.refresh();
    };

    createNew();
    const btnReset = document.getElementById('btnReset');
    btnReset.addEventListener('click', (e) => createNew(), true);
});

class BoardRenderer {
    constructor(board) {
        if (!board) {
            throw 'The board cannot be null';
        }

        this.board = board;
        this._createTable();
    }

    _createTable() {
        const tableId = 'board';
        this.container = document.getElementById('boardContainer');
        
        this.table = document.getElementById(tableId) || document.createElement('table');
        this.table.setAttribute('id', tableId);
        this.table.className = 'board';
        
        this.container.appendChild(this.table);
    }

    _render() {
        this._clearTable();
        for (let rowIndex = 0; rowIndex < this.board.matrix.length; rowIndex++) {
            const row = this._createRow(rowIndex);
            for (let colIndex = 0; colIndex < this.board.matrix[rowIndex].length; colIndex++) {
                let field = this.board.matrix[rowIndex][colIndex];
                const cell = this._createCell(colIndex, field, row);
            }
        }
    }

    _cellClick(event) {
        const id = event.target.id;
        console.log(event.target);
        console.log(id);

        switch (event.button) {
            case 0:
                this.board.click(id);
                break;
            case 2:
                this.board.mark(id);
                break;
            default:
                break;
        }

        this.refresh();
    }

    _clearTable() {
        this.table.innerHTML = '';
    }

    refresh() {
        this._render();
    }

    _createRow(index) {
        const row = this.table.insertRow(index);
        return row;
    }

    _createCell(index, field, row) {
        const cell = row.insertCell(index);
        cell.addEventListener('oncontextmenu', (e) => e.preventDefault(), true);
        //cell.innerHTML = field.marked ? '!' : (field.clicked ? '' : (field.mined ? '*' : field.minedNeighborsNumber));
        cell.innerHTML = field.marked ? '!' : (field.mined ? '*' : field.minedNeighborsNumber);
        cell.setAttribute("title", JSON.stringify(field));
        cell.setAttribute("id", field.id);

        if (!field.clicked) {
            cell.addEventListener('mouseup', (e) => this._cellClick(e), true);
        }
        else {
            cell.className = 'clicked';
        }

        return cell;
    }
}

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
        this._setNeighborsMinesNumber();
    }

    click(id) {
        let field = this._getFieldById(id);

        if (field.mined) {
            throw '!!! Game over !!!';
        }

        field.click();

        if (field.minedNeighborsNumber === 0) {
            //this._checkNeighborsFields(neighborsFields);
            this._checkNeighbors(field);
        }
    }

    mark(id) {
        let field = this._getFieldById(id);

        if (field.marked) {
            field.unmark();
        }
        else {
            field.mark();
        }
    }

    _checkNeighbors(inputField) {
        let neighbors = this._getNeighborsFields(inputField);
        for (let i = 0; i < neighbors.length; i++) {
            const currentField = neighbors[i];

            if (currentField.mined || currentField.marked) {
                continue;
            }

            currentField.click();

            if (currentField.minedNeighborsNumber > 0) {
                continue;
            }

            this._checkNeighbors(currentField);
        }
    }

    _checkNeighborsFields(fields) {
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            if (field.mined || field.marked) {
                continue;
            }

            field.click();

            if (field.minedNeighborsNumber > 0) {
                continue;
            }

            // const fs = this._getNeighborsFields(field);
            // this._checkNeighborsFields(fs);
        }
    }

    _getNeighborsFields(field) {
        let neighborsFields = [];
        for (let rowIndex = field.rowIndex == 0 ? 0 : field.rowIndex - 1; rowIndex <= field.rowIndex + 1 && rowIndex < this.rows; rowIndex++) {
            for (let colIndex = field.colIndex == 0 ? 0 : field.colIndex - 1; colIndex <= field.colIndex + 1 && colIndex < this.cols; colIndex++) {
                const currentField = this.matrix[rowIndex][colIndex];
                if (currentField.id !== field.id) {
                    neighborsFields.push(currentField);
                }
            }
        }
        return neighborsFields;
    }

    _setNeighborsMinesNumber() {
        for (let rowIndex = 0; rowIndex < this.matrix.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.matrix[rowIndex].length; colIndex++) {
                let field = this.matrix[rowIndex][colIndex];
                let neighborsFields = this._getNeighborsFields(field);
                let minedNeighborsNumber = neighborsFields.filter(f => f.mined).length || 0;
                field.setMinedNeighborsNumber(minedNeighborsNumber);
            }
        }
    }

    _getFieldById(id) {
        if (!id) {
            throw 'id is required';
        }

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
        this.marked = false;
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
        // if (!this.clicked) {
        //     throw "The field isn't clicked yet. Cannot set the mined neighbors number.";
        // }

        // if (this.mined) {
        //     throw 'Cannot set the mined neighbors count on mined field.';
        // }

        this.minedNeighborsNumber = minedNeighborsNumber || 0;
    }

    mark() {
        if (this.clicked) {
            throw `Cannot mark clicked field: '${this.id}'`;
        }

        if (this.marked) {
            throw `The field: '${this.id}' is already marked.`;
        }

        this.marked = true;
    }

    unmark() {
        if (this.clicked) {
            throw `Cannot unmark clicked field: '${this.id}'`;
        }

        if (!this.marked) {
            throw `The field with id: '${this.id}' is already unmarked`;
        }

        this.marked = false;
    }

    click() {
        // if (this.clicked) {
        //     throw `The field with: '${this.id}' is already clicked`;
        // }

        if (this.marked) {
            throw `Cannot click marked field: '${this.id}'`;
        }

        this.clicked = true;
    }

    isMined() {
        return this.mined;
    }
}