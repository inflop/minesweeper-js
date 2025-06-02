"use strict";

import { ThemeManager } from './infrastructure/ThemeManager.js';
import { Config } from './domain/value-objects/GameConfiguration.js';
import { GAME_CONFIG, EMOJI } from './common/GameSettings.js';
import { GameTimer } from './infrastructure/GameTimer.js';
import { GAME_CONSTANTS } from './common/GameConstants.js';
import { createContainer, registerDevelopmentServices } from './infrastructure/ServiceRegistration.js';
import { BoardRenderer } from './presentation/BoardRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const flaggedCounterDiv = document.querySelector('.flaggedCounter');
  const timerDiv = document.querySelector('.timer');
  const boardContainer = document.querySelector('.board');
  const btnNewGame = document.getElementById('btnNewGame');
  const lnkBeginner = document.getElementById('lnkBeginner');
  const lnkIntermediate = document.getElementById('lnkIntermediate');
  const lnkExpert = document.getElementById('lnkExpert');

  // Initialize theme manager
  new ThemeManager();

  // Initialize DI container
  let container;
  let gameService;
  let boardRenderer;
  let gameTimer;
  let eventBus;

  container = createContainer();
  registerDevelopmentServices(container);

  const handleNewGame = (rows, cols) => {
    btnNewGame.innerHTML = EMOJI.start;
    if (gameTimer) gameTimer.stop();
    timerDiv.innerHTML = '0';

    document.getElementById("numRows").value = rows;
    document.getElementById("numCols").value = cols;

    // Clean up previous game
    if (boardRenderer) {
      boardRenderer.destroy();
    }

    const config = new Config(rows, cols, GAME_CONFIG.minesPercentage);
    
    // Create game service
    const gameServiceFactory = container.resolve('gameServiceFactory');
    gameService = gameServiceFactory(config);
    
    // Get dependencies
    const cellRenderer = container.resolve('cellRenderer');
    eventBus = container.resolve('eventBus');
    
    // Create board renderer with the actual board from game service
    const board = gameService.getBoard();
    boardRenderer = new BoardRenderer(board, cellRenderer, gameService, eventBus, boardContainer);

    // Setup game timer
    gameTimer = new GameTimer((seconds) => {
      timerDiv.innerHTML = `${seconds}s`;
    });

    // Setup event listeners
    setupEventListeners(config);

    // Start the game
    const startResult = gameService.startNewGame();
    if (startResult.isSuccess) {
      flaggedCounterDiv.innerHTML = config.minesNumber;
      boardRenderer.refreshBoard();
    } else {
      console.error('Failed to start game:', startResult.error);
    }
  };

  const setupEventListeners = (config) => {
    // Subscribe to game events
    eventBus.subscribe('first-move', () => {
      gameTimer.start();
    });

    eventBus.subscribe('cell-flagged', (event) => {
      const gameStateResult = gameService.getGameState();
      if (gameStateResult.isSuccess) {
        const gameState = gameStateResult.value;
        flaggedCounterDiv.innerHTML = gameState.remainingMines;
      }
    });

    eventBus.subscribe('game-won', (event) => {
      gameTimer.stop();
      btnNewGame.innerHTML = EMOJI.won;
    });

    eventBus.subscribe('game-lost', (event) => {
      gameTimer.stop();
      btnNewGame.innerHTML = EMOJI.lost;
    });
  };

  lnkBeginner.addEventListener('click', () => handleNewGame(GAME_CONFIG.beginner.rows, GAME_CONFIG.beginner.cols));
  lnkIntermediate.addEventListener('click', () => handleNewGame(GAME_CONFIG.intermediate.rows, GAME_CONFIG.intermediate.cols));
  lnkExpert.addEventListener('click', () => handleNewGame(GAME_CONFIG.expert.rows, GAME_CONFIG.expert.cols));

  btnNewGame.addEventListener('click', () => {
    const rows = +document.getElementById("numRows").value || 10;
    const cols = +document.getElementById("numCols").value || 10;
    handleNewGame(rows, cols);
  });

  // Auto-load beginner game on page load
  handleNewGame(GAME_CONFIG.beginner.rows, GAME_CONFIG.beginner.cols);
});