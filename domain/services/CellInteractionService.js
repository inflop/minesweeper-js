"use strict";

import { Result } from "../../common/Result.js";
import { TypeGuards } from "../../common/TypeGuards.js";
import { NeighborService } from "./NeighborService.js";

export class CellInteractionService {
  constructor(gameRules) {
    this._gameRules = gameRules;
  }
  revealCell(board, position) {
    if (!TypeGuards.isValidPosition(position)) {
      return Result.failure("Invalid position provided");
    }

    const cellResult = board.getCellAt(position);
    if (cellResult.isFailure) {
      return cellResult;
    }

    const cell = cellResult.value;

    if (!this._gameRules.canRevealCell(cell)) {
      return Result.failure("Cell cannot be revealed according to game rules");
    }

    const revealResult = cell.reveal();
    if (revealResult.isFailure) {
      return revealResult;
    }

    // If cell contains a mine, explode it
    if (cell.containsMine) {
      const explodeResult = cell.explode();
      if (explodeResult.isFailure) {
        return explodeResult;
      }
      return Result.success({
        type: "explosion",
        cell: cell,
        position: position,
      });
    }

    // If cell has no neighboring mines, reveal neighbors recursively
    if (!cell.hasMinedNeighbors) {
      const revealNeighborsResult = this._revealEmptyNeighbors(board, position);
      if (revealNeighborsResult.isFailure) {
        return revealNeighborsResult;
      }

      return Result.success({
        type: "cascade_reveal",
        cell: cell,
        position: position,
        revealedNeighbors: revealNeighborsResult.value,
      });
    }

    return Result.success({
      type: "single_reveal",
      cell: cell,
      position: position,
    });
  }

  toggleCellFlag(board, position) {
    if (!TypeGuards.isValidPosition(position)) {
      return Result.failure("Invalid position provided");
    }

    const cellResult = board.getCellAt(position);
    if (cellResult.isFailure) {
      return cellResult;
    }

    const cell = cellResult.value;

    if (!this._gameRules.canFlagCell(cell)) {
      return Result.failure("Cell cannot be flagged according to game rules");
    }

    const flagResult = cell.toggleFlag();
    if (flagResult.isFailure) {
      return flagResult;
    }

    return Result.success({
      type: "flag_toggle",
      cell: cell,
      position: position,
      action: flagResult.value.action,
    });
  }

  _revealEmptyNeighbors(board, position) {
    const neighborsResult = NeighborService.getNeighborCells(board, position);
    if (neighborsResult.isFailure) {
      return neighborsResult;
    }

    const neighbors = neighborsResult.value;
    const allRevealedCells = [];
    const cellsToProcess = [];

    // Collect all neighbors to process
    for (const neighborCell of neighbors) {
      if (neighborCell.canBeRevealed() && !neighborCell.containsMine) {
        cellsToProcess.push(neighborCell);
      }
    }

    // Process cells in queue (breadth-first)
    while (cellsToProcess.length > 0) {
      const currentCell = cellsToProcess.shift();

      // Check if cell hasn't been revealed already
      if (!currentCell.canBeRevealed()) {
        continue;
      }

      // Reveal the cell
      const revealResult = currentCell.reveal();
      if (revealResult.isFailure) {
        continue;
      }

      // Add to revealed cells list
      allRevealedCells.push({
        type: currentCell.hasMinedNeighbors
          ? "single_reveal"
          : "cascade_reveal",
        cell: currentCell,
        position: currentCell.position,
      });

      // If cell has no neighboring mines, add its neighbors to queue
      if (!currentCell.hasMinedNeighbors) {
        const nextNeighborsResult = NeighborService.getNeighborCells(
          board,
          currentCell.position
        );
        if (nextNeighborsResult.isSuccess) {
          for (const nextNeighbor of nextNeighborsResult.value) {
            if (nextNeighbor.canBeRevealed() && !nextNeighbor.containsMine) {
              // Check if neighbor is not already in queue
              if (
                !cellsToProcess.includes(nextNeighbor) &&
                !allRevealedCells.some(
                  (revealed) => revealed.cell.id === nextNeighbor.id
                )
              ) {
                cellsToProcess.push(nextNeighbor);
              }
            }
          }
        }
      }
    }

    return Result.success(allRevealedCells);
  }

  revealAllMines(board) {
    const revealedMines = [];

    for (let x = 0; x < board.bounds.rows; x++) {
      for (let y = 0; y < board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = board.getCellAt(position);

        if (cellResult.isSuccess) {
          const cell = cellResult.value;
          if (cell.containsMine) {
            // If mine is not yet exploded or revealed, reveal it
            if (!cell.isExploded && !cell.isRevealed) {
              const revealResult = cell.reveal();
              if (revealResult.isSuccess) {
                revealedMines.push({ cell, position });
              }
            } else {
              // If mine is already exploded/revealed, add it to list
              revealedMines.push({ cell, position });
            }
          }
        }
      }
    }

    return Result.success(revealedMines);
  }

  findWrongFlags(board) {
    const wrongFlags = [];

    for (let x = 0; x < board.bounds.rows; x++) {
      for (let y = 0; y < board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = board.getCellAt(position);

        if (cellResult.isSuccess) {
          const cell = cellResult.value;
          // Cell is wrongly flagged if it's flagged but doesn't contain mine
          if (cell.isFlagged && !cell.containsMine) {
            wrongFlags.push({ cell, position });
          }
        }
      }
    }

    return Result.success(wrongFlags);
  }

  disableAllCells(board) {
    const disabledCells = [];

    for (let x = 0; x < board.bounds.rows; x++) {
      for (let y = 0; y < board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = board.getCellAt(position);

        if (cellResult.isSuccess) {
          const cell = cellResult.value;
          const disableResult = cell.disable();
          if (disableResult.isSuccess) {
            disabledCells.push({ cell, position });
          }
        }
      }
    }

    return Result.success(disabledCells);
  }
}
