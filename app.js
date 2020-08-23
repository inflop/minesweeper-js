"use strict";

document.addEventListener('DOMContentLoaded', (e) => {
  const resultDiv = document.querySelector('.summary-result');
  const flaggedCounterDiv = document.querySelector('.flaggedCounter');
  const timerDiv = document.querySelector('.timer');
  const boardContainer = document.querySelector('.board');
  const btnNewGame = document.getElementById('btnNewGame');
  const lnkBeginner = document.getElementById('lnkBeginner');
  const lnkIntermediate = document.getElementById('lnkIntermediate');
  const lnkExpert = document.getElementById('lnkExpert');
  let timer;
  const minesPercentage = 15;

  const emojiStart = '&#128512;';
  const emojiLost = '&#128553;';
  const emojiWon = '&#128526;';

  lnkBeginner.addEventListener('click', () => {
    newBeginnerGame();
  }, true);

  lnkIntermediate.addEventListener('click', () => {
    newIntermediateGame();
  }, true);

  lnkExpert.addEventListener('click', () => {
    newExpertGame();
  }, true);

  btnNewGame.addEventListener('click', () => {
    newCustomGame();
  }, true);

  const newCustomGame = () => {
    const rows = +document.getElementById("numRows").value || 10;
    const cols = +document.getElementById("numCols").value || 10;
    newGame(rows, cols, minesPercentage);
  };

  const newBeginnerGame = () => {
    newGame(8, 8, minesPercentage);
  };

  const newIntermediateGame = () => {
    newGame(16, 16, minesPercentage);
  };

  const newExpertGame = () => {
    newGame(16, 30, minesPercentage);
  };

  const newGame = (rows, cols, minesPercentage) => {
    btnNewGame.innerHTML = emojiStart;
    clearInterval(timer);
    //resultDiv.innerHTML = '';
    timerDiv.innerHTML = '0';

    document.getElementById("numRows").value = rows;
    document.getElementById("numCols").value = cols;

    const config = new Config(rows, cols, minesPercentage);
    const board = new Board(config);
    const boardRenderer = new BoardRenderer(board, boardContainer);
    const game = new Game(config, board, boardRenderer);

    game.addEventListener('start', (e) => {
      let second = 1;
      timer = setInterval(() => {
        timerDiv.innerHTML = `${second++}s`;
      }, 1000);
    }, false);

    game.addEventListener('change', (e) => {
      flaggedCounterDiv.innerHTML = e.detail.flaggedMinesCount;
    }, false);

    game.addEventListener('end', (e) => {
      clearInterval(timer);
      const result = e.detail.result;

      if (result === GameResult.NONE) {
        throw 'Something went wrong. The result cannot be "NONE" at the end of the game';
      }

      const emoji = (result === GameResult.LOST ? emojiLost : emojiWon);
      btnNewGame.innerHTML = emoji;

    }, false);
    
    flaggedCounterDiv.innerHTML = config.minesNumber;
    game.new();
  };

  newBeginnerGame();
});