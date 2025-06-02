"use strict";

import { GAME_CONSTANTS } from '../common/GameConstants.js';
import { TypeGuards } from '../common/TypeGuards.js';
import { Result } from '../common/Result.js';

export class BoardRenderer {
  #board;
  #cellRenderer;
  #gameService;
  #eventBus;
  #domContainer;
  #tableElement;
  #cellElements;

  constructor(board, cellRenderer, gameService, eventBus, domContainer) {
    this.#board = board;
    this.#cellRenderer = cellRenderer;
    this.#gameService = gameService;
    this.#eventBus = eventBus;
    this.#domContainer = domContainer;
    this.#cellElements = new Map();

    this.#initializeEventListeners();
    this.#createBoardTable();
  }

  refreshBoard() {
    this.#clearBoard();
    this.#createBoardTable();
    this.#renderAllCells();
    return Result.success('Board refreshed');
  }
  
  updateCell(position) {
    const cellResult = this.#board.getCellAt(position);
    if (cellResult.isFailure) {
      console.error('Failed to get cell:', cellResult.error);
      return cellResult;
    }

    const cell = cellResult.value;
    
    const cellElement = this.#cellElements.get(cell.id);

    if (!cellElement) {
      console.error(`Cell element not found for position ${position.x},${position.y}`);
      return Result.failure(`Cell element not found for position ${position.x},${position.y}`);
    }

    const renderResult = this.#cellRenderer.render(cell);
    
    cellElement.innerHTML = renderResult.content;
    cellElement.className = renderResult.className;

    return Result.success('Cell updated');
  }

  #initializeEventListeners() {
    this.#eventBus.subscribe('cell-revealed', (event) => {
      this.updateCell(event.data.position);
    });

    this.#eventBus.subscribe('cell-flagged', (event) => {
      this.updateCell(event.data.position);
    });

    this.#eventBus.subscribe('game-won', () => {
      this.#disableAllCellInteractions();
    });

    this.#eventBus.subscribe('game-lost', () => {
      this.#disableAllCellInteractions();
    });
  }

  #createBoardTable() {
    this.#tableElement = document.createElement('table');
    this.#tableElement.className = 'board-table';

    for (let x = 0; x < this.#board.bounds.rows; x++) {
      const row = document.createElement('tr');

      for (let y = 0; y < this.#board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = this.#board.getCellAt(position);

        if (cellResult.isSuccess) {
          const cell = cellResult.value;
          const cellElement = this.#createCellElement(cell, position);
          row.appendChild(cellElement);
        }
      }

      this.#tableElement.appendChild(row);
    }

    this.#domContainer.appendChild(this.#tableElement);
  }

  #createCellElement(cell, position) {
    const cellElement = document.createElement('td');
    const renderResult = this.#cellRenderer.render(cell);

    cellElement.innerHTML = renderResult.content;
    cellElement.className = renderResult.className;
    cellElement.dataset.cellId = cell.id;
    cellElement.dataset.x = position.x.toString();
    cellElement.dataset.y = position.y.toString();

    // Add event listeners for cell interactions
    cellElement.addEventListener('click', (event) => {
      this.#handleCellClick(event, position);
    });

    cellElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      this.#handleCellRightClick(event, position);
    });

    cellElement.addEventListener('mousedown', (event) => {
      this.#handleCellMouseDown(event, position);
    });

    this.#cellElements.set(cell.id, cellElement);
    return cellElement;
  }  #handleCellClick(event, position) {
    // Click event is always left button by default
    if (!this.#gameService) {
      console.error('GameService is null or undefined!');
      return;
    }
    
    const revealResult = this.#gameService.revealCell(position);
    if (revealResult.isFailure) {
      console.warn(`Failed to reveal cell at ${position.x},${position.y}: ${revealResult.error}`);
    }
  }

  #handleCellRightClick(event, position) {
    const flagResult = this.#gameService.toggleCellFlag(position);
    if (flagResult.isFailure) {
      console.warn(`Failed to flag cell at ${position.x},${position.y}: ${flagResult.error}`);
    }
  }

  #handleCellMouseDown(event, position) {
    if (event.button === GAME_CONSTANTS.MOUSE_BUTTONS.MIDDLE) {
      // Middle click - could be used for chord clicking in future
      event.preventDefault();
    }
  }

  #renderAllCells() {
    for (let x = 0; x < this.#board.bounds.rows; x++) {
      for (let y = 0; y < this.#board.bounds.cols; y++) {
        const position = { x, y };
        this.updateCell(position);
      }
    }
  }

  #disableAllCellInteractions() {
    this.#cellElements.forEach((cellElement) => {
      cellElement.style.pointerEvents = 'none';
    });
  }

  #clearBoard() {
    if (this.#tableElement) {
      this.#tableElement.remove();
    }
    this.#cellElements.clear();
  }

  destroy() {
    this.#clearBoard();
    // Remove event listeners
    this.#eventBus.clear();
    return Result.success('Board renderer destroyed');
  }
}