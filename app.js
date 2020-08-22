"use strict";

document.addEventListener('DOMContentLoaded', (event) => {
  const resultDiv = document.querySelector('.summary-result');
  const flaggedCounterDiv = document.querySelector('.flaggedCounter');
  const timerDiv = document.querySelector('.timer');

  const btnReset = document.getElementById('btnReset');
  btnReset.addEventListener('click', () => newGame(), true);

  let timeRunner;

  const newGame = () => {
    clearInterval(timeRunner);
    resultDiv.innerHTML = '';
    timerDiv.innerHTML = '0';

    const rows = parseInt(document.getElementById("numRows").value) || 10;
    const cols = parseInt(document.getElementById("numCols").value) || 10;
    const minesPercentage = 15;

    const config = new Config(rows, cols, minesPercentage);
    flaggedCounterDiv.innerHTML = config.minesNumber;

    let game = new Game(config);
    game.addEventListener('start', (e) => {
      let second = 1;
      timeRunner = setInterval(() => {
        timerDiv.innerHTML = second++;
      }, 1000);
    }, false);

    game.addEventListener('change', (e) => {
      flaggedCounterDiv.innerHTML = e.detail.flaggedMinesCount;
    }, false);

    game.addEventListener('end', (e) => {
      const result = e.detail.result;
      if (result === GameResult.NONE) {
        throw 'Something went wrong. The result cannot be "NONE" at the end';
      }

      const msg = `You ${result === GameResult.LOST ? 'lost &#128078' : 'won &#128077'}`;
      const color = (result === GameResult.LOST ? 'red' : 'green');

      resultDiv.innerHTML = msg;
      resultDiv.style.color = color;

      clearInterval(timeRunner);
    }, false);

    game.new();
  };

  newGame();
});