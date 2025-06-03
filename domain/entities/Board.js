"use strict";

import { Result } from "../../common/Result.js";
import { TypeGuards } from "../../common/TypeGuards.js";

export class Board {
  #matrix;
  #bounds;
  #cellPositionMap;

  constructor(bounds, cellFactory) {
    if (!TypeGuards.isValidBounds(bounds)) {
      throw new TypeError("Invalid bounds provided");
    }
    if (!TypeGuards.isFunction(cellFactory)) {
      throw new TypeError("Cell factory must be a function");
    }

    this.#bounds = Object.freeze({ ...bounds });
    this.#cellPositionMap = new Map();
    this.#matrix = this.#createMatrix(cellFactory);
  }

  get bounds() {
    return this.#bounds;
  }

  get matrix() {
    return this.#matrix.map((row) => [...row]); // Return a copy to prevent external modification
  }

  getCellAt(position) {
    if (!TypeGuards.isValidPosition(position)) {
      return Result.failure("Invalid position provided");
    }

    if (!this.#isPositionWithinBounds(position)) {
      return Result.failure(
        `Position ${position.x},${position.y} is out of bounds`
      );
    }

    const cell = this.#matrix[position.x][position.y];
    return Result.success(cell);
  }

  getCellById(cellId) {
    if (!TypeGuards.isValidCellId(cellId)) {
      return Result.failure("Invalid cell ID provided");
    }

    const position = this.#cellPositionMap.get(cellId);
    if (!position) {
      return Result.failure(`Cell with ID '${cellId}' not found`);
    }

    return this.getCellAt(position);
  }

  getAllCells() {
    const cells = [];
    for (let x = 0; x < this.#bounds.rows; x++) {
      for (let y = 0; y < this.#bounds.cols; y++) {
        cells.push(this.#matrix[x][y]);
      }
    }
    return cells;
  }

  getMineCells() {
    return this.getAllCells().filter((cell) => cell.containsMine);
  }

  getNonMineCells() {
    return this.getAllCells().filter((cell) => !cell.containsMine);
  }

  getFlaggedCells() {
    return this.getAllCells().filter((cell) => cell.isFlagged);
  }

  getRevealedCells() {
    return this.getAllCells().filter((cell) => cell.isRevealed);
  }

  getHiddenCells() {
    return this.getAllCells().filter((cell) => cell.isHidden);
  }

  countCells(predicate) {
    if (!TypeGuards.isFunction(predicate)) {
      return Result.failure("Predicate must be a function");
    }

    try {
      const count = this.getAllCells().filter(predicate).length;
      return Result.success(count);
    } catch (error) {
      return Result.failure(`Error counting cells: ${error.message}`);
    }
  }

  forEachCell(callback) {
    if (!TypeGuards.isFunction(callback)) {
      return Result.failure("Callback must be a function");
    }

    try {
      for (let x = 0; x < this.#bounds.rows; x++) {
        for (let y = 0; y < this.#bounds.cols; y++) {
          const cell = this.#matrix[x][y];
          const position = { x, y };
          callback(cell, position, x, y);
        }
      }
      return Result.success("Iteration completed");
    } catch (error) {
      return Result.failure(`Error during iteration: ${error.message}`);
    }
  }

  #createMatrix(cellFactory) {
    const matrix = [];

    for (let x = 0; x < this.#bounds.rows; x++) {
      matrix[x] = [];
      for (let y = 0; y < this.#bounds.cols; y++) {
        const position = { x, y };
        const cell = cellFactory(position);

        matrix[x][y] = cell;
        this.#cellPositionMap.set(cell.id, position);
      }
    }

    return matrix;
  }

  #isPositionWithinBounds(position) {
    return (
      position.x >= 0 &&
      position.x < this.#bounds.rows &&
      position.y >= 0 &&
      position.y < this.#bounds.cols
    );
  }
  placeMine(position) {
    const cellResult = this.getCellAt(position);
    if (cellResult.isFailure) {
      return cellResult;
    }

    const cell = cellResult.value;
    if (cell.containsMine) {
      return Result.failure("Cell already contains a mine");
    }

    // Set existing cell as mine instead of creating new instance
    const setMineResult = cell.setAsMine();
    if (setMineResult.isFailure) {
      return setMineResult;
    }

    return Result.success({ cellId: cell.id, position });
  }

  placeMines(positions) {
    const results = [];
    for (const position of positions) {
      const result = this.placeMine(position);
      results.push(result);
      if (result.isFailure) {
        return Result.failure(
          `Failed to place mine at ${position.x},${position.y}: ${result.error}`
        );
      }
    }
    return Result.success(results.map((r) => r.value));
  }

  clone() {
    const clonedMatrix = this.#matrix.map((row) =>
      row.map((cell) => cell.clone())
    );

    const clonedBoard = Object.create(Board.prototype);
    clonedBoard.#bounds = { ...this.#bounds };
    clonedBoard.#matrix = clonedMatrix;
    clonedBoard.#cellPositionMap = new Map();

    // Rebuild cell position map
    clonedBoard.forEachCell((cell, position) => {
      clonedBoard.#cellPositionMap.set(cell.id, position);
    });

    return clonedBoard;
  }

  equals(other) {
    if (!(other instanceof Board)) {
      return false;
    }

    if (
      this.#bounds.rows !== other.bounds.rows ||
      this.#bounds.cols !== other.bounds.cols
    ) {
      return false;
    }

    for (let x = 0; x < this.#bounds.rows; x++) {
      for (let y = 0; y < this.#bounds.cols; y++) {
        if (!this.#matrix[x][y].equals(other.matrix[x][y])) {
          return false;
        }
      }
    }

    return true;
  }

  toString() {
    return `Board(${this.#bounds.rows}x${this.#bounds.cols})`;
  }
}
