"use strict";

export class GameRules {
  canRevealCell(cell) {
    return cell.canBeRevealed();
  }

  canFlagCell(cell) {
    return cell.canBeFlagged();
  }

  isGameWon(board) {
    // Game is won when all non-mine cells are revealed and all mine cells are flagged or unrevealed
    for (let x = 0; x < board.bounds.rows; x++) {
      for (let y = 0; y < board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = board.getCellAt(position);

        if (cellResult.isFailure) {
          continue;
        }

        const cell = cellResult.value;

        if (cell.containsMine) {
          // Mine cells can be flagged or hidden, but not revealed (unless exploded)
          if (cell.isRevealed && !cell.isExploded) {
            return false;
          }
        } else {
          // Non-mine cells must be revealed
          if (!cell.isRevealed) {
            return false;
          }
        }
      }
    }
    return true;
  }

  isGameLost(board) {
    // Game is lost when any mine cell is exploded
    for (let x = 0; x < board.bounds.rows; x++) {
      for (let y = 0; y < board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = board.getCellAt(position);

        if (cellResult.isFailure) {
          continue;
        }

        const cell = cellResult.value;
        if (cell.containsMine && cell.isExploded) {
          return true;
        }
      }
    }
    return false;
  }

  isValidMineCount(mineCount, totalCells) {
    return mineCount >= 0 && mineCount < totalCells;
  }

  isValidBoardSize(rows, cols) {
    const MIN_SIZE = 5;
    const MAX_SIZE = 100;

    return (
      rows >= MIN_SIZE &&
      rows <= MAX_SIZE &&
      cols >= MIN_SIZE &&
      cols <= MAX_SIZE
    );
  }

  calculateOptimalMineCount(rows, cols, percentage = 15) {
    const totalCells = rows * cols;
    const mineCount = Math.floor((totalCells * percentage) / 100);

    // Ensure at least 1 mine and at most totalCells - 1
    return Math.max(1, Math.min(mineCount, totalCells - 1));
  }

  validateGameConfiguration(config) {
    const errors = [];

    if (!this.isValidBoardSize(config.rows, config.cols)) {
      errors.push("Invalid board size");
    }

    const totalCells = config.rows * config.cols;
    if (!this.isValidMineCount(config.minesNumber, totalCells)) {
      errors.push("Invalid mine count");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
}
