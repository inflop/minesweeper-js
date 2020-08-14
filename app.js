document.addEventListener('DOMContentLoaded', (event) => {
    createNew();
    const btnReset = document.getElementById('btnReset');
    btnReset.addEventListener('click', (e) => createNew(), true);
});

const createNew = () => {
    const rows = parseInt(document.getElementById("numRows").value) || 10;
    const cols = parseInt(document.getElementById("numCols").value) || 10;
    const minesPercentage = 15;

    let board = new Board(rows, cols, minesPercentage);
    let renderer = new BoardRenderer(board);
    renderer.refreshBoard();
};

class Game {
    constructor(board, boardContainer) {
        this.board = board;
        this.boardContainer = boardContainer;
    }

    createNew() {

    }
}

class BoardRenderer {
    constructor(board) {
        if (!board) {
            throw 'The board cannot be null';
        }

        this.board = board;
        this._createBoard();

        this.colors = {
            1: '#403f3f',
            2: '#d11141',
            3: '#00aedb',
            4: '#f37735',
            5: '#ffc425',
            6: '#00b159',
            7: '#9ea19a',
            8: '#ff4682',
        };
    }

    _createBoard() {
        const tableId = 'board';
        this.container = document.querySelector('.container');

        this.table = document.getElementById(tableId) || document.createElement('table');
        this.table.setAttribute('id', tableId);
        this.table.className = 'board';

        this.container.appendChild(this.table);
    }

    _renderBoard() {
        this._clearBoard();
        for (let x = 0; x < this.board.matrix.length; x++) {
            const row = this._createRow(x);
            for (let y = 0; y < this.board.matrix[x].length; y++) {
                let field = this.board.matrix[x][y];
                const tableCell = this._createTableCell(y, field, row);
            }
        }
    }

    _cellClick(event) {
        const fieldId = event.target.id;

        try {
            switch (event.button) {
                case 0:
                    this.board.check(fieldId);
                    break;
                case 2:
                    this.board.toggle(fieldId);
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error(e);
            this._checkError(e);
        }

        this.refreshBoard();
        //this._setCellFontColor(fieldId);
    }

    _checkError(error) {
        if (error instanceof CheckedMinedFieldError) {
            alert(error.message);
            //this.refreshBoard();
        }
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

    _getCellContent(field) {
        const charMine = '&#9728;'
        const charFlag = '&#9873;'

        const showInnerHtml = field.revealed || field.flagged || (field.checked && (field.hasMinedNeighbors || field.mined));
        if (!showInnerHtml) {
            return '';
        }

        if (field.flagged && !field.revealed) {
            return charFlag;
        }

        if (field.hasMinedNeighbors) {
            return field.minedNeighborsNumber;
        }

        if (field.mined) {
            return charMine;
        }

        return '';
    }

    _createTableCell(index, field, row) {

        const cell = row.insertCell(index);
        cell.setAttribute("id", field.id);

        cell.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        cell.innerHTML = this._getCellContent(field);

        const isMouseUpEventListener = !field.checked && !field.disabled && !field.revealed;
        if (isMouseUpEventListener) {
            cell.addEventListener('mouseup', (e) => this._cellClick(e), true);
        }

        if (field.checked) {
            cell.classList.add('checked');

            if (field.mined) {
                cell.classList.add('mined');
            }

            if (field.hasMinedNeighbors && !field.mined) {
                cell.style.color = this.colors[field.minedNeighborsNumber];
            }
        }

        if (field.revealed) {
            cell.classList.add('revealed');
        }

        return cell;
    }
}

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
            throw 'Cannot set the mined neighbors number on mined field.';
        }

        this._minedNeighborsNumber = value || 0;
    }

    get minedNeighborsNumber() {
        return this._minedNeighborsNumber;
    }

    toggleFlag() {
        if (!this._flagged) {

            if (this._disabled) {
                throw `Cannot flag disabled field: '${this.id}'`;
            }

            if (this._revealed) {
                throw `Cannot flag revealed field: '${this.id}'`;
            }

            if (this._checked) {
                throw `Cannot flag checked field: '${this.id}'`;
            }
        }
        else {
            if (this._disabled) {
                throw `Cannot unflag disabled field: '${this.id}'`;
            }
    
            if (this._revealed) {
                throw `Cannot unflag revealed field: '${this.id}'`;
            }
    
            if (this._checked) {
                throw `Cannot unflag checked field: '${this.id}'`;
            }
        }

        this._flagged = !this._flagged;
    }

    get flagged() {
        return this._flagged;
    }

    get checked() {
        return this._checked;
    }

    check() {
        if (this._disabled) {
            throw `Cannot check disabled field: '${this.id}'`;
        }

        if (this._revealed) {
            throw `Cannot check revealed field: '${this.id}'`;
        }

        if (this._checked) {
            throw `The field with: '${this.id}' is already checked`;
        }

        if (this._flagged) {
            throw `Cannot check flagged field: '${this.id}'`;
        }

        this._checked = true;
    }

    get revealed() {
        return this._revealed;
    }

    reveal() {
        if (!this.mined) {
            throw `Only mined fields can be revealed`;
        }

        this.disable();
        this._revealed = true;
    }
}

class Position {
    constructor(x, y) {
        if (isNaN(x)) {
            throw 'x value must be a number';
        }

        if (isNaN(y)) {
            throw 'y value must be a number';
        }

        this.x = x;
        this.y = y;
    }
}

class CheckedMinedFieldError extends Error {
    constructor(fieldId) {
        super(`You checked mined field: ${fieldId}. You lost!!!`);
        this.fieldId = fieldId;
    }
}