"use strict";

import { Container } from "./Container.js";
import { EventBus } from "../common/EventBus.js";
import { GameRules } from "../domain/services/GameRules.js";
import { CellInteractionService } from "../domain/services/CellInteractionService.js";
import { NeighborService } from "../domain/services/NeighborService.js";
import { Board } from "../domain/entities/Board.js";
import { Cell } from "../domain/entities/Cell.js";
import { MinesweeperGameService } from "../application/MinesweeperGameService.js";
import { CellRenderer } from "../presentation/CellRenderer.js";
import { GameOverService } from "./GameOverService.js";
import { GAME_CONSTANTS } from "../common/GameConstants.js";

export function createContainer() {
  const container = new Container();

  // Core infrastructure
  container.register("eventBus", () => new EventBus(), { singleton: true });
  container.register("gameOverService", () => new GameOverService(), {
    singleton: true,
  });

  // Domain services
  container.register("gameRules", () => new GameRules(), { singleton: true });
  container.register("neighborService", () => new NeighborService(), {
    singleton: true,
  });
  container.register(
    "cellInteractionService",
    (gameRules) => new CellInteractionService(gameRules),
    {
      dependencies: ["gameRules"],
    }
  );

  // Presentation services
  container.register(
    "cellRenderer",
    (gameOverService) => new CellRenderer(gameOverService),
    {
      dependencies: ["gameOverService"],
      singleton: true,
    }
  );

  // Board factory
  container.register(
    "boardFactory",
    () => {
      return (config) => {
        const bounds = { rows: config.rows, cols: config.cols };
        const cellFactory = (position) => {
          const cellId = `${GAME_CONSTANTS.CELL_ID_PREFIX}${position.x}_${position.y}`;
          const cell = new Cell(cellId, false, position);
          return cell;
        };
        return new Board(bounds, cellFactory);
      };
    },
    { singleton: true }
  );

  // Game service factory
  container.register(
    "gameServiceFactory",
    (
      boardFactory,
      gameRules,
      cellInteractionService,
      eventBus,
      gameOverService
    ) => {
      return (config) => {
        // Generate board
        const board = boardFactory(config);

        // Place mines
        const minePositions = generateMinePositions(config);
        placeMinesOnBoard(board, minePositions);

        // Calculate neighbor mine counts
        const neighborsResult =
          NeighborService.calculateMineCountsForBoard(board);
        if (neighborsResult.isFailure) {
          throw new Error(
            `Failed to calculate mine counts: ${neighborsResult.error}`
          );
        }

        return new MinesweeperGameService(
          board,
          gameRules,
          cellInteractionService,
          eventBus,
          gameOverService
        );
      };
    },
    {
      dependencies: [
        "boardFactory",
        "gameRules",
        "cellInteractionService",
        "eventBus",
        "gameOverService",
      ],
    }
  );

  return container;
}

function generateMinePositions(config) {
  const positions = [];
  const totalCells = config.rows * config.cols;

  if (config.minesNumber >= totalCells) {
    throw new Error("Mine count cannot exceed total cells");
  }

  while (positions.length < config.minesNumber) {
    const x = Math.floor(Math.random() * config.rows);
    const y = Math.floor(Math.random() * config.cols);
    const positionKey = `${x},${y}`;

    if (!positions.some((pos) => `${pos.x},${pos.y}` === positionKey)) {
      positions.push({ x, y });
    }
  }

  return positions;
}

function placeMinesOnBoard(board, minePositions) {
  const result = board.placeMines(minePositions);
  if (result.isFailure) {
    throw new Error(result.error);
  }
  return result.value;
}

export function registerDevelopmentServices(container) {
  // Development-specific services can be added here
  container.register(
    "logger",
    () => {
      return {
        log: (...args) => console.log("[MINESWEEPER]", ...args),
        warn: (...args) => console.warn("[MINESWEEPER]", ...args),
        error: (...args) => console.error("[MINESWEEPER]", ...args),
      };
    },
    { singleton: true }
  );

  return container;
}

export function registerProductionServices(container) {
  // Production-specific services can be added here
  container.register(
    "logger",
    () => {
      return {
        log: () => {}, // No-op in production
        warn: (...args) => console.warn("[MINESWEEPER]", ...args),
        error: (...args) => console.error("[MINESWEEPER]", ...args),
      };
    },
    { singleton: true }
  );

  return container;
}
