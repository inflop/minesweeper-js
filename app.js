document.addEventListener('DOMContentLoaded', (event) => {
    const rows = 10;
    const cols = 10;
    const minesPercent = 20;

    const createNew = () => {
        let board = new Board(rows, cols, minesPercent);
        const renderer = new BoardRenderer(board);
        renderer.refreshBoard();
    };

    createNew();
    const btnReset = document.getElementById('btnReset');
    btnReset.addEventListener('click', (e) => createNew(), true);
});

// const ClassNames = {
//     MINE: 'im im-sun',
//     MARK: 'im im-flag',
//     INVALID_MARK: 
// }

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

        try {
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
        }
        catch(e) {
            console.error(e);
            this._checkError(e);
        }

        this.refreshBoard();
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
        const charMine = '&#9899;'
        const charFlag = '&#9873;'

        const showInnerHtml = field.revealed || field.marked || (field.checked && (field.hasMinedNeighbors || field.mined));
        if (!showInnerHtml) {
            return '';
        }

        if (field.marked && !field.revealed) {
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

    _createCell(index, field, row) {
        const cell = row.insertCell(index);
        cell.setAttribute("id", field.id);
        // cell.setAttribute("title", JSON.stringify(field));

        cell.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        cell.innerHTML = this._getCellContent(field);

        const isMouseUpEventListener = !field.checked && !field.disabled;
        if (isMouseUpEventListener) {
            cell.addEventListener('mouseup', (e) => this._cellClick(e), true);
        }

        if (field.checked) {
            cell.classList.add('checked');
        }

        if (field.mined) {
            cell.classList.add('mined');
        }

        if (field.revealed) {
            cell.classList.add('revealed');
        }

        if (field.marked) {
            cell.classList.add('marked');
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
            this._revealAllMines();
            throw new CheckedMinedFieldError(fieldId);
        }

        if (field.minedNeighborsNumber === 0) {
            this._checkNeighbors(field);
        }
    }

    /**
     * Reveals and displays all mines.
     */
    _revealAllMines() {
        for (let rowIndex = 0; rowIndex < this.matrix.length; rowIndex++) {
            for (let colIndex = 0; colIndex < this.matrix[rowIndex].length; colIndex++) {
                let field = this.matrix[rowIndex][colIndex];
                field.disable();
                if (field.mined) {
                    field.reveal();
                }
            }
        }
    }

    /**
     * Set mine flag on the field with specified ID.
     * @param {string} fieldId 
     */
    markField(fieldId) {
        let field = this._getFieldById(fieldId);

        if (field.marked) {
            field.unmark();
        }
        else {
            field.mark();
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
            if (!currentField.checked && !currentField.mined && !currentField.marked) {
                this.checkField(currentField.id);
            }
        }
    }

    /**
     * 
     * @param {Field} field
     */
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

    /**
     * 
     */
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

    /**
     * 
     * @param {string} fieldId
     */
    _getFieldById(fieldId) {
        if (!fieldId) {
            throw 'Field ID is required';
        }

        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                let field = this.matrix[i][j];
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
        for (let i = array.length-1; i > 0; i--) {
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
        this._disabled = false;
        this._revealed = false;
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

    get marked() {
        return this._marked;
    }

    mark() {
        if (this._disabled) {
            throw `Cannot mark disabled field: '${this.id}'`;
        }

        if (this._revealed) {
            throw `Cannot mark revealed field: '${this.id}'`;
        }

        if (this._checked) {
            throw `Cannot mark checked field: '${this.id}'`;
        }

        if (this._marked) {
            throw `The field: '${this.id}' is already marked.`;
        }

        this._marked = true;
    }

    unmark() {
        if (this._disabled) {
            throw `Cannot unmark disabled field: '${this.id}'`;
        }

        if (this._revealed) {
            throw `Cannot unmark revealed field: '${this.id}'`;
        }

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
        if (this._disabled) {
            throw `Cannot check disabled field: '${this.id}'`;
        }

        if (this._revealed) {
            throw `Cannot check revealed field: '${this.id}'`;
        }

        if (this._checked) {
            throw `The field with: '${this.id}' is already checked`;
        }

        if (this._marked) {
            throw `Cannot check marked field: '${this.id}'`;
        }

        this._checked = true;
    }

    get revealed() {
        return this._revealed;
    }

    reveal() {
        this._disabled = true;
        this._revealed = true;
    }
}

class CheckedMinedFieldError extends Error {
    constructor(fieldId) {
        super(`You checked mined field: ${fieldId}. You lost!!!`);
        this.fieldId = fieldId;
    }
}
