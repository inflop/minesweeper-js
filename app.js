"use strict";

document.addEventListener('DOMContentLoaded', (e) => {
  const flaggedCounterDiv = document.querySelector('.flaggedCounter');
  const timerDiv = document.querySelector('.timer');
  const boardContainer = document.querySelector('.board');
  const btnNewGame = document.getElementById('btnNewGame');
  const lnkBeginner = document.getElementById('lnkBeginner');
  const lnkIntermediate = document.getElementById('lnkIntermediate');
  const lnkExpert = document.getElementById('lnkExpert');
  let timer;

  const GAME_CONFIG = {
    minesPercentage: 15,
    beginner: { rows: 8, cols: 8 },
    intermediate: { rows: 16, cols: 16 },
    expert: { rows: 16, cols: 30 }
  };

  const EMOJI = {
    start: '&#128512;',
    lost: '&#128553;',
    won: '&#128526;'
  };

  lnkBeginner.addEventListener('click', () => {
    newGame(GAME_CONFIG.beginner.rows, GAME_CONFIG.beginner.cols);
  }, true);

  lnkIntermediate.addEventListener('click', () => {
    newGame(GAME_CONFIG.intermediate.rows, GAME_CONFIG.intermediate.cols);
  }, true);

  lnkExpert.addEventListener('click', () => {
    newGame(GAME_CONFIG.expert.rows, GAME_CONFIG.expert.cols);
  }, true);

  btnNewGame.addEventListener('click', () => {
    const rows = +document.getElementById("numRows").value || 10;
    const cols = +document.getElementById("numCols").value || 10;
    newGame(rows, cols);
  }, true);

  const newGame = (rows, cols) => {
    btnNewGame.innerHTML = EMOJI.start;
    clearInterval(timer);
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

    game.addEventListener('start', (e) => {
      let second = 1;
      timer = setInterval(() => {
        timerDiv.innerHTML = `${second++}s`;
        gameState.updateTime(second);
      }, 1000);
    }, false);

    game.addEventListener('change', (e) => {
      flaggedCounterDiv.innerHTML = e.detail.flaggedMinesCount;
    }, false);

    game.addEventListener('end', (e) => {
      clearInterval(timer);
      const result = e.detail.result;

      if (result === GameResult.NONE) {
        throw new Error('Something went wrong. The result cannot be "NONE" at the end of the game');
      }

      const emoji = (result === GameResult.LOST ? EMOJI.lost : EMOJI.won);
      btnNewGame.innerHTML = emoji;
    }, false);

    flaggedCounterDiv.innerHTML = config.minesNumber;
    game.new();
  };

  newGame(GAME_CONFIG.beginner.rows, GAME_CONFIG.beginner.cols);

  // Theme switcher logic
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      if (body.classList.contains('theme-light')) {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        localStorage.setItem('theme', 'dark');
      } else if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        localStorage.setItem('theme', 'light');
      } else {
        // If no class, check system preference and switch to opposite
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        if (prefersLight) {
          body.classList.add('theme-dark');
          localStorage.setItem('theme', 'dark');
        } else {
          body.classList.add('theme-light');
          localStorage.setItem('theme', 'light');
        }
      }
    });
  }

  // Set theme on load from localStorage or system preference
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    }
  })();
});