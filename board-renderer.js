"use strict";

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
    this.container = document.querySelector('.board');

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
        let cell = this.board.matrix[x][y];
        const tableCell = this._createTableCell(y, cell, row);
      }
    }
  }

  _cellClick(event) {
    const cellId = event.target.id;

    try {
      switch (event.button) {
        case 0: // left mouse button
          this.board.check(cellId);
          break;
        case 2: // right mouse button
          this.board.toggle(cellId);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
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

  _getCellContent(cell) {
    const charMine = '&#9728;'
    const charFlag = '&#9873;'

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
      return charMine;
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