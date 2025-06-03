"use strict";

import { NeighborCalculator } from "../../common/NeighborCalculator.js";
import { TypeGuards } from "../../common/TypeGuards.js";
import { Result } from "../../common/Result.js";

export class NeighborService {
  static calculateNeighborPositions(position, bounds) {
    if (!TypeGuards.isValidPosition(position)) {
      return Result.failure("Invalid position provided");
    }
    if (!TypeGuards.isValidBounds(bounds)) {
      return Result.failure("Invalid bounds provided");
    }

    try {
      const neighbors = NeighborCalculator.calculateNeighbors(position, bounds);
      return Result.success(neighbors);
    } catch (error) {
      return Result.failure(error.message);
    }
  }

  static getNeighborCells(board, position) {
    const neighborsResult = this.calculateNeighborPositions(
      position,
      board.bounds
    );
    if (neighborsResult.isFailure) {
      return neighborsResult;
    }

    const neighbors = neighborsResult.value;
    const neighborCells = [];

    for (const neighborPos of neighbors) {
      const cellResult = board.getCellAt(neighborPos);
      if (cellResult.isSuccess) {
        neighborCells.push(cellResult.value);
      }
    }

    return Result.success(neighborCells);
  }

  static countMinesInNeighbors(neighborCells) {
    if (!Array.isArray(neighborCells)) {
      return Result.failure("Neighbor cells must be an array");
    }

    const mineCount = neighborCells.filter((cell) => cell.containsMine).length;
    return Result.success(mineCount);
  }

  static calculateMineCountsForBoard(board) {
    const results = [];

    for (let x = 0; x < board.bounds.rows; x++) {
      for (let y = 0; y < board.bounds.cols; y++) {
        const position = { x, y };
        const cellResult = board.getCellAt(position);

        if (cellResult.isFailure) {
          continue;
        }

        const cell = cellResult.value;
        if (cell.containsMine) {
          continue;
        }

        const neighborsResult = this.getNeighborCells(board, position);
        if (neighborsResult.isFailure) {
          results.push(
            Result.failure(
              `Failed to get neighbors for position ${x},${y}: ${neighborsResult.error}`
            )
          );
          continue;
        }

        const mineCountResult = this.countMinesInNeighbors(
          neighborsResult.value
        );
        if (mineCountResult.isFailure) {
          results.push(
            Result.failure(
              `Failed to count mines for position ${x},${y}: ${mineCountResult.error}`
            )
          );
          continue;
        }

        const setCountResult = cell.setNeighborMineCount(mineCountResult.value);
        results.push(setCountResult);
      }
    }

    const failures = results.filter((r) => r.isFailure);
    if (failures.length > 0) {
      return Result.failure(
        `Failed to calculate mine counts: ${failures
          .map((f) => f.error)
          .join(", ")}`
      );
    }

    return Result.success("Mine counts calculated successfully");
  }
}
