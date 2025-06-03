"use strict";

import { Result } from '../common/Result.js';
import { TypeGuards } from '../common/TypeGuards.js';
import { GAME_CONSTANTS } from '../common/GameConstants.js';
import {
  GameStartedEvent,
  GameWonEvent,
  GameLostEvent,
  CellRevealedEvent,
  CellFlaggedEvent,
  FirstMoveEvent
} from '../common/EventBus.js';

export class MinesweeperGameService {
  #board;
  #gameRules;
  #cellInteractionService;
  #eventBus;
  #gameOverService;
  #gameState;
  #isGameActive;
  #isFirstMove;

  constructor(board, gameRules, cellInteractionService, eventBus, gameOverService) {
    this.#board = board;
    this.#gameRules = gameRules;
    this.#cellInteractionService = cellInteractionService;
    this.#eventBus = eventBus;
    this.#gameOverService = gameOverService;
    this.#gameState = this.#createInitialGameState();
    this.#isGameActive = false;
    this.#isFirstMove = true;
  }

  startNewGame() {
    this.#gameState = this.#createInitialGameState();
    this.#isGameActive = true;
    this.#isFirstMove = true;

    // Clear previous game over state
    this.#gameOverService.clearWrongFlags();

    const event = new GameStartedEvent();
    this.#eventBus.publish(event);

    return Result.success({
      message: 'New game started',
      gameState: { ...this.#gameState }
    });
  }

  revealCell(position) {
    if (!this.#isGameActive) {
      return Result.failure('Game is not active');
    }

    if (!TypeGuards.isValidPosition(position)) {
      return Result.failure('Invalid position provided');
    }

    // If this is the first move, publish first-move event
    if (this.#isFirstMove) {
      this.#isFirstMove = false;
      const firstMoveEvent = new FirstMoveEvent({
        position,
        timestamp: new Date()
      });
      this.#eventBus.publish(firstMoveEvent);
    }

    const revealResult = this.#cellInteractionService.revealCell(this.#board, position);
    if (revealResult.isFailure) {
      return revealResult;
    }

    const revealData = revealResult.value;
    this.#updateGameStateAfterReveal(revealData);

    // Publish event for the main cell
    const mainCellEvent = new CellRevealedEvent({
      position,
      cell: revealData.cell,
      type: revealData.type
    });
    this.#eventBus.publish(mainCellEvent);

    // If cascade reveal happened, publish events for all revealed neighbors
    if (revealData.type === 'cascade_reveal' && revealData.revealedNeighbors) {
      for (const neighborData of revealData.revealedNeighbors) {
        this.#updateGameStateAfterReveal(neighborData);
        const neighborEvent = new CellRevealedEvent({
          position: neighborData.position,
          cell: neighborData.cell,
          type: neighborData.type
        });
        this.#eventBus.publish(neighborEvent);
      }
    }

    // Check for game end conditions
    const gameEndResult = this.#checkGameEndConditions();
    if (gameEndResult.isSuccess && gameEndResult.value.gameEnded) {
      this.#endGame(gameEndResult.value.result);
    }

    return Result.success({
      revealData,
      gameState: { ...this.#gameState },
      gameActive: this.#isGameActive
    });
  }

  toggleCellFlag(position) {
    if (!this.#isGameActive) {
      return Result.failure('Game is not active');
    }

    if (!TypeGuards.isValidPosition(position)) {
      return Result.failure('Invalid position provided');
    }

    const flagResult = this.#cellInteractionService.toggleCellFlag(this.#board, position);
    if (flagResult.isFailure) {
      return flagResult;
    }

    const flagData = flagResult.value;
    this.#updateGameStateAfterFlag(flagData);

    // Publish cell flagged event
    const cellEvent = new CellFlaggedEvent({
      position,
      cell: flagData.cell,
      action: flagData.action
    });
    this.#eventBus.publish(cellEvent);

    // Check for game end conditions (in case all mines are correctly flagged)
    const gameEndResult = this.#checkGameEndConditions();
    if (gameEndResult.isSuccess && gameEndResult.value.gameEnded) {
      this.#endGame(gameEndResult.value.result);
    }

    return Result.success({
      flagData,
      gameState: { ...this.#gameState },
      gameActive: this.#isGameActive
    });
  }

  getGameState() {
    return Result.success({
      ...this.#gameState,
      isActive: this.#isGameActive
    });
  }

  getBoardState() {
    return Result.success({
      bounds: this.#board.bounds,
      cells: this.#board.getAllCells().map(cell => ({
        id: cell.id,
        position: cell.position,
        state: cell.state,
        containsMine: cell.containsMine,
        neighborMineCount: cell.neighborMineCount
      }))
    });
  }

  getBoard() {
    return this.#board;
  }

  #createInitialGameState() {
    const totalCells = this.#board.bounds.rows * this.#board.bounds.cols;
    const mineCells = this.#board.getMineCells();

    return Object.freeze({
      flaggedCellsCount: 0,
      revealedCellsCount: 0,
      remainingMines: mineCells.length,
      totalCells,
      mineCount: mineCells.length,
      result: GAME_CONSTANTS.GAME_RESULTS.NONE,
      startTime: new Date(),
      endTime: null,
      isCompleted: false
    });
  }

  #updateGameStateAfterReveal(revealData) {
    const revealedCells = this.#board.getRevealedCells();

    this.#gameState = Object.freeze({
      ...this.#gameState,
      revealedCellsCount: revealedCells.length
    });
  }

  #updateGameStateAfterFlag(flagData) {
    const flaggedCells = this.#board.getFlaggedCells();
    const mineCells = this.#board.getMineCells();

    this.#gameState = Object.freeze({
      ...this.#gameState,
      flaggedCellsCount: flaggedCells.length,
      remainingMines: mineCells.length - flaggedCells.length
    });
  }

  #checkGameEndConditions() {
    if (this.#gameRules.isGameLost(this.#board)) {
      return Result.success({
        gameEnded: true,
        result: GAME_CONSTANTS.GAME_RESULTS.LOST
      });
    }

    if (this.#gameRules.isGameWon(this.#board)) {
      return Result.success({
        gameEnded: true,
        result: GAME_CONSTANTS.GAME_RESULTS.WON
      });
    }

    return Result.success({
      gameEnded: false,
      result: GAME_CONSTANTS.GAME_RESULTS.NONE
    });
  }

  #endGame(result) {
    this.#isGameActive = false;
    this.#finalizeGameState(result);

    if (result === GAME_CONSTANTS.GAME_RESULTS.LOST) {
      this.#handleGameLoss();
    }

    this.#disableAllCells();
    this.#publishGameEndEvent(result);
  }

  #finalizeGameState(result) {
    const endTime = new Date();
    const duration = endTime - this.#gameState.startTime;

    this.#gameState = Object.freeze({
      ...this.#gameState,
      result,
      endTime,
      duration,
      isCompleted: true
    });
  }

  #handleGameLoss() {
    this.#revealAllMines();
    this.#markAndPublishWrongFlags();
  }

  #revealAllMines() {
    const revealMinesResult = this.#cellInteractionService.revealAllMines(this.#board);
    if (revealMinesResult.isSuccess) {
      for (const mineData of revealMinesResult.value) {
        const cellEvent = new CellRevealedEvent({
          position: mineData.position,
          cell: mineData.cell,
          type: 'mine_reveal'
        });
        this.#eventBus.publish(cellEvent);
      }
    }
  }

  #markAndPublishWrongFlags() {
    const wrongFlagsResult = this.#cellInteractionService.findWrongFlags(this.#board);
    if (wrongFlagsResult.isSuccess) {
      for (const wrongFlagData of wrongFlagsResult.value) {
        // Mark in GameOverService for presentation layer
        this.#gameOverService.markCellAsWrongFlag(wrongFlagData.cell.id);

        const cellEvent = new CellRevealedEvent({
          position: wrongFlagData.position,
          cell: wrongFlagData.cell,
          type: 'wrong_flag'
        });
        this.#eventBus.publish(cellEvent);
      }
    }
  }

  #disableAllCells() {
    this.#cellInteractionService.disableAllCells(this.#board);
  }

  #publishGameEndEvent(result) {
    const GameEndEvent = result === GAME_CONSTANTS.GAME_RESULTS.WON ? GameWonEvent : GameLostEvent;
    const event = new GameEndEvent({
      duration: this.#gameState.duration,
      flaggedCellsCount: this.#gameState.flaggedCellsCount,
      revealedCellsCount: this.#gameState.revealedCellsCount,
      result
    });
    this.#eventBus.publish(event);
  }
}