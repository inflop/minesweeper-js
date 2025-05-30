"use strict";

export class BoardRenderer {
  constructor(board, boardContainer) {
    if (!board) {
      throw new Error('The board cannot be null');
    }

    if (!boardContainer) {
      throw new Error('The board container cannot be null');
    }

    this._board = board;
    this._boardContainer = boardContainer;
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
    this.table = document.getElementById(tableId) || document.createElement('table');
    this.table.setAttribute('id', tableId);
    this.table.className = 'board';
    this._boardContainer.appendChild(this.table);
  }

  _renderBoard() {
    this._clearBoard();
    for (let x = 0; x < this._board.matrix.length; x++) {
      const row = this._createRow(x);
      for (let y = 0; y < this._board.matrix[x].length; y++) {
        const cell = this._board.matrix[x][y];
        this._createTableCell(y, cell, row);
      }
    }
  }

  _cellClick(event) {
    const cellId = event.target.id;

    try {
      switch (event.button) {
        case 0: // left mouse button
          this._board.check(cellId);
          break;
        case 2: // right mouse button
          this._board.toggle(cellId);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
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
    return this.table.insertRow(index);
  }

  _getCellContent(cell) {
    const charExploded = '&#128165;';
    const charMine = '&#128163;';
    const charFlag = '&#128204;';

    const showInnerHtml = cell.revealed || cell.flagged || (cell.checked && (cell.hasMinedNeighbors || cell.mined));
    if (!showInnerHtml) {
      return '';
    }

    if (cell.flagged && !cell.revealed) {
      return charFlag;
    }

    if (cell.hasMinedNeighbors) {
      return cell.minedNeighborsNumber;
    }

    if (cell.mined) {
      return cell.checked ? charExploded : charMine;
    }

    return '';
  }

  _createTableCell(index, cell, row) {
    const tableCell = row.insertCell(index);
    tableCell.setAttribute("id", cell.id);

    tableCell.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    tableCell.innerHTML = this._getCellContent(cell);

    const isMouseUpEventListener = !cell.checked && !cell.disabled && !cell.revealed;
    if (isMouseUpEventListener) {
      tableCell.addEventListener('mouseup', (e) => this._cellClick(e), true);
    }

    if (cell.checked) {
      tableCell.classList.add('checked');

      if (cell.mined) {
        tableCell.classList.add('mined');
      }

      if (cell.hasMinedNeighbors && !cell.mined) {
        tableCell.style.color = this.colors[cell.minedNeighborsNumber];
      }
    }

    if (cell.revealed) {
      tableCell.classList.add('revealed');
    }

    return tableCell;
  }
}