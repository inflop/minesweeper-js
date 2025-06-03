"use strict";

import { Result } from "../common/Result.js";

/**
 * Infrastructure service for managing game-over presentation effects
 * Handles visual indicators like wrong flags after game ends
 */
export class GameOverService {
  #wrongFlaggedCells = new Set();

  markCellAsWrongFlag(cellId) {
    this.#wrongFlaggedCells.add(cellId);
    return Result.success({ cellId });
  }

  isCellWrongFlag(cellId) {
    return this.#wrongFlaggedCells.has(cellId);
  }

  clearWrongFlags() {
    this.#wrongFlaggedCells.clear();
  }

  getWrongFlaggedCells() {
    return Array.from(this.#wrongFlaggedCells);
  }
}
