"use strict";

import { ThemeManager } from './theme-manager.js';
import { Config } from './config.js';
import { BoardGenerator } from './board-generator.js';
import { BoardStateManager } from './board-state-manager.js';
import { Board } from './board.js';
import { BoardRenderer } from './board-renderer.js';
import { GameState } from './game-state.js';
import { Game } from './game.js';
import { GameResult } from './states.js';
import { GameTimer } from './game-timer.js';
import { GAME_CONFIG, EMOJI } from './game-config.js';

document.addEventListener('DOMContentLoaded', () => {
  const flaggedCounterDiv = document.querySelector('.flaggedCounter');
  const timerDiv = document.querySelector('.timer');
  const boardContainer = document.querySelector('.board');
  const btnNewGame = document.getElementById('btnNewGame');
  const lnkBeginner = document.getElementById('lnkBeginner');
  const lnkIntermediate = document.getElementById('lnkIntermediate');
  const lnkExpert = document.getElementById('lnkExpert');

  // Initialize theme manager
  new ThemeManager();

  let gameTimer;

  const handleNewGame = (rows, cols) => {
    btnNewGame.innerHTML = EMOJI.start;
    if (gameTimer) gameTimer.stop();
    timerDiv.innerHTML = '0';

    document.getElementById("numRows").value = rows;
    document.getElementById("numCols").value = cols;

    const config = new Config(rows, cols, GAME_CONFIG.minesPercentage);
    const boardGenerator = new BoardGenerator();
    const boardStateManager = new BoardStateManager(config);
    const board = new Board(config, boardGenerator, boardStateManager);
    const boardRenderer = new BoardRenderer(board, boardContainer);
    const gameState = new GameState();
    const game = new Game(config, board, boardRenderer, gameState);
    gameTimer = new GameTimer((seconds) => {
      timerDiv.innerHTML = `${seconds}s`;
      gameState.updateTime(seconds);
    });

    game.addEventListener('start', () => {
      gameTimer.start();
    });

    game.addEventListener('change', (e) => {
      flaggedCounterDiv.innerHTML = e.detail.flaggedMinesCount ?? e.detail.flaggedCellsCount ?? 0;
    });

    game.addEventListener('end', (e) => {
      gameTimer.stop();
      const result = e.detail.result;
      if (result === GameResult.NONE) {
        throw new Error('Something went wrong. The result cannot be "NONE" at the end of the game');
      }
      const emoji = result === GameResult.LOST ? EMOJI.lost : EMOJI.won;
      btnNewGame.innerHTML = emoji;
    });

    flaggedCounterDiv.innerHTML = config.minesNumber;
    game.new();
  };

  lnkBeginner.addEventListener('click', () => handleNewGame(GAME_CONFIG.beginner.rows, GAME_CONFIG.beginner.cols));
  lnkIntermediate.addEventListener('click', () => handleNewGame(GAME_CONFIG.intermediate.rows, GAME_CONFIG.intermediate.cols));
  lnkExpert.addEventListener('click', () => handleNewGame(GAME_CONFIG.expert.rows, GAME_CONFIG.expert.cols));

  btnNewGame.addEventListener('click', () => {
    const rows = +document.getElementById("numRows").value || 10;
    const cols = +document.getElementById("numCols").value || 10;
    handleNewGame(rows, cols);
  });

  // Start with beginner level
  handleNewGame(GAME_CONFIG.beginner.rows, GAME_CONFIG.beginner.cols);
});