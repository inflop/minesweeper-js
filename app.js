document.addEventListener('DOMContentLoaded', (event) => {
  createNew();
  const btnReset = document.getElementById('btnReset');
  btnReset.addEventListener('click', (e) => createNew(), true);
});

const createNew = () => {
  const rows = parseInt(document.getElementById("numRows").value) || 10;
  const cols = parseInt(document.getElementById("numCols").value) || 10;
  const minesPercentage = 15;

  let game = new Game(rows, cols, minesPercentage);
  game.create();
};

class CheckedMinedFieldError extends Error {
  constructor(fieldId) {
    super(`You checked mined field: ${fieldId}. You lost!!!`);
    this.fieldId = fieldId;
  }
}