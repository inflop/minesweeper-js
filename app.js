"use strict";

document.addEventListener('DOMContentLoaded', (e) => {
  const resultDiv = document.querySelector('.summary-result');
  const flaggedCounterDiv = document.querySelector('.flaggedCounter');
  const timerDiv = document.querySelector('.timer');
  const boardContainer = document.querySelector('.board');
  const btnReset = document.getElementById('btnReset');
  let timer;

  btnReset.addEventListener('click', () => newGame(), true);

  const newGame = () => {
    clearInterval(timer);
    resultDiv.innerHTML = '';
    timerDiv.innerHTML = '0';

    const rows = +document.getElementById("numRows").value || 10;
    const cols = +document.getElementById("numCols").value || 10;
    const minesPercentage = 15;

    const config = new Config(rows, cols, minesPercentage);
    const board = new Board(config);
    const boardRenderer = new BoardRenderer(board, boardContainer);
    const game = new Game(config, board, boardRenderer);

    game.addEventListener('start', (e) => {
      let second = 1;
      timer = setInterval(() => {
        timerDiv.innerHTML = second++;
      }, 1000);
    }, false);

    game.addEventListener('change', (e) => {
      flaggedCounterDiv.innerHTML = e.detail.flaggedMinesCount;
    }, false);

    game.addEventListener('end', (e) => {
      const result = e.detail.result;
      if (result === GameResult.NONE) {
        throw 'Something went wrong. The result cannot be "NONE" at the end of the game';
      }

      const msg = `You ${result === GameResult.LOST ? 'lost &#128078' : 'won &#128077'}`;
      const color = (result === GameResult.LOST ? 'red' : 'green');

      resultDiv.innerHTML = msg;
      resultDiv.style.color = color;

      clearInterval(timer);
    }, false);

    flaggedCounterDiv.innerHTML = config.minesNumber;
    game.new();
  };

  newGame();
});