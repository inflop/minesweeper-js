document.addEventListener('DOMContentLoaded', (event) => {
    const rows = 10;
    const cols = 10;
    const minesPercent = 20;
    let board = new Board(rows, cols, minesPercent);

    const createNew = () => {
        const renderer = new BoardRenderer(board);
        renderer.refreshBoard();
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
        this._createBoard();
    }

    _createBoard() {
        const tableId = 'board';
        this.container = document.getElementById('boardContainer');

        this.table = document.getElementById(tableId) || document.createElement('table');
        this.table.setAttribute('id', tableId);
        this.table.className = 'board';

        this.container.appendChild(this.table);
    }

    _renderBoard() {
        this._clearBoard();
        for (let rowIndex = 0; rowIndex < this.board.matrix.length; rowIndex++) {
            const row = this._createRow(rowIndex);
            for (let colIndex = 0; colIndex < this.board.matrix[rowIndex].length; colIndex++) {
                let field = this.board.matrix[rowIndex][colIndex];
                const cell = this._createCell(colIndex, field, row);
            }
        }
    }

    _cellClick(event) {
        const fieldId = event.target.id;
        switch (event.button) {
            case 0:
                this.board.checkField(fieldId);
                break;
            case 2:
                this.board.markField(fieldId);
                break;
            default:
                break;
        }

        this.refreshBoard();
    }

    _clearBoard() {
        this.table.innerHTML = '';
    }

    refreshBoard() {
        this._renderBoard();
    }

    _createRow(index) {
        const row = this.table.insertRow(index);
        return row;
    }

    _createCell(index, field, row) {
        const cell = row.insertCell(index);
        cell.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        const showInnerHtml = field.marked || (field.checked && (field.hasMinedNeighbors || field.mined));

        if (showInnerHtml) {
            let innerHtml = '';
            if (field.marked) {
                innerHtml = '!';
            }
            else if (field.hasMinedNeighbors) {
                innerHtml = field.minedNeighborsNumber;
            }
            else if (field.mined) {
                innerHtml = '*';
            }

            cell.innerHTML = innerHtml;
        }

        cell.setAttribute("title", JSON.stringify(field));
        cell.setAttribute("id", field.id);

        if (!field.checked) {
            cell.addEventListener('mouseup', (e) => this._cellClick(e), true);
        }
        else {
            cell.className = ' checked';
        }

        if (field.mined) {
            cell.className += ' mined';
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

    checkField(fieldId) {
        let field = this._getFieldById(fieldId);

        field.check();

        if (field.mined) {
            return;
            // TODO: 
            // GAME OVER
        }

        if (field.minedNeighborsNumber === 0) {
            this._checkNeighbors(field);
        }
    }

    markField(fieldId) {
        let field = this._getFieldById(fieldId);

        if (field.marked) {
            field.unmark();
        }
        else {
            field.mark();
        }
    }

    _checkNeighbors(field) {
        let neighborsFields = this._getNeighborsFields(field);
        for (let i = 0; i < neighborsFields.length; i++) {
            const currentField = neighborsFields[i];
            if (!currentField.checked && !currentField.mined && !currentField.marked) {
                this.checkField(currentField.id);
            }            
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
                if (!field.mined) {
                    field.minedNeighborsNumber = minedNeighborsNumber;
                }                
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
                field.rowIndex = rowIndex;
                field.colIndex = colIndex;
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
        this._rowIndex = 0;
        this._colIndex = 0;
        this._minedNeighborsNumber = 0;
        this._marked = false;
        this._checked = false;
    }

    set rowIndex(rowIndex) {
        if (isNaN(rowIndex)) {
            throw 'Row index must be a number';
        }

        this._rowIndex = rowIndex;
    }

    get rowIndex() {
        return this._rowIndex;
    }

    set colIndex(colIndex) {
        if (isNaN(colIndex)) {
            throw 'Column index must be a number';
        }

        this._colIndex = colIndex;
    }

    get colIndex() {
        return this._colIndex;
    }

    get hasMinedNeighbors() {
        return (this._minedNeighborsNumber || 0) > 0;
    }

    set minedNeighborsNumber(value) {
        if (this.mined) {
            throw 'Cannot set the mined neighbors number on mined field.';
        }

        this._minedNeighborsNumber = value || 0;
    }

    get minedNeighborsNumber() {
        return this._minedNeighborsNumber;
    }

    get marked() {
        return this._marked;
    }

    mark() {
        if (this._checked) {
            throw `Cannot mark checked field: '${this.id}'`;
        }

        if (this._marked) {
            throw `The field: '${this.id}' is already marked.`;
        }

        this._marked = true;
    }

    unmark() {
        if (this._checked) {
            throw `Cannot unmark checked field: '${this.id}'`;
        }

        if (!this._marked) {
            throw `The field with id: '${this.id}' is already unmarked`;
        }

        this._marked = false;
    }

    get checked() {
        return this._checked;
    }

    check() {
        if (this._checked) {
            throw `The field with: '${this.id}' is already checked`;
        }

        if (this._marked) {
            throw `Cannot check marked field: '${this.id}'`;
        }

        this._checked = true;
    }
}