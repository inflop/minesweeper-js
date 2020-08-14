class Position {
  constructor(x, y) {
    if (isNaN(x)) {
      throw 'x value must be a number';
    }

    if (isNaN(y)) {
      throw 'y value must be a number';
    }

    this.x = x;
    this.y = y;
  }
}