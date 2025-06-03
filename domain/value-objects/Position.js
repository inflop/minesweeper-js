"use strict";

import { TypeGuards } from "../../common/TypeGuards.js";
import { NeighborCalculator } from "../../common/NeighborCalculator.js";

export class Position {
  #x;
  #y;

  constructor(x, y) {
    if (!TypeGuards.isNumber(x) || !TypeGuards.isNumber(y)) {
      throw new TypeError("Position coordinates must be numbers");
    }

    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new TypeError("Position coordinates must be integers");
    }

    if (x < 0 || y < 0) {
      throw new RangeError("Position coordinates must be non-negative");
    }

    this.#x = Object.freeze(x);
    this.#y = Object.freeze(y);
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  equals(other) {
    if (!(other instanceof Position)) {
      return false;
    }
    return this.#x === other.x && this.#y === other.y;
  }

  isAdjacentTo(other) {
    if (!(other instanceof Position)) {
      return false;
    }
    const deltaX = Math.abs(this.#x - other.x);
    const deltaY = Math.abs(this.#y - other.y);
    return deltaX <= 1 && deltaY <= 1 && (deltaX > 0 || deltaY > 0);
  }

  getNeighborPositions(bounds) {
    return NeighborCalculator.calculateNeighbors(this, bounds).map(
      ({ x, y }) => new Position(x, y)
    );
  }

  manhattanDistanceTo(other) {
    if (!(other instanceof Position)) {
      throw new TypeError("Other must be a Position instance");
    }
    return Math.abs(this.#x - other.x) + Math.abs(this.#y - other.y);
  }

  isWithinBounds(bounds) {
    if (!TypeGuards.isValidBounds(bounds)) {
      throw new TypeError("Invalid bounds provided");
    }
    return (
      this.#x >= 0 &&
      this.#x < bounds.rows &&
      this.#y >= 0 &&
      this.#y < bounds.cols
    );
  }

  toString() {
    return `Position(${this.#x}, ${this.#y})`;
  }

  toKey() {
    return `${this.#x},${this.#y}`;
  }

  static fromKey(key) {
    const [x, y] = key.split(",").map(Number);
    return new Position(x, y);
  }

  static create(x, y) {
    return new Position(x, y);
  }
}
