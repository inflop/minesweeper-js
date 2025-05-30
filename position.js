"use strict";

export class Position {
  constructor(x, y) {
    if (isNaN(x)) {
      throw new Error('x value must be a number');
    }

    if (isNaN(y)) {
      throw new Error('y value must be a number');
    }

    this.x = x;
    this.y = y;
  }
}