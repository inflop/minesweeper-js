class Game {
  constructor(rows, cols, minesPercentage) {
    this.rows = rows;
    this.cols = cols;
    this.minesPercentage = minesPercentage;
  }

  create() {
    this.board = new Board(this.rows, this.cols, this.minesPercentage);
    this.renderer = new BoardRenderer(this.board);
    this.renderer.refreshBoard();
  }
}