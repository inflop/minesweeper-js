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
        case 0: // left mouse button
          this.board.check(fieldId);
          break;
        case 2: // right mouse button
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