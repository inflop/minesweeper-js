"use strict";

import { TypeGuards } from './TypeGuards.js';

export class NeighborCalculator {
  static calculateNeighbors(position, bounds) {
    if (!TypeGuards.isValidPosition(position)) {
      throw new TypeError('Invalid position provided');
    }
    if (!TypeGuards.isValidBounds(bounds)) {
      throw new TypeError('Invalid bounds provided');
    }

    const neighbors = [];
    const startX = Math.max(0, position.x - 1);
    const startY = Math.max(0, position.y - 1);
    const endX = Math.min(position.x + 1, bounds.rows - 1);
    const endY = Math.min(position.y + 1, bounds.cols - 1);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        if (x !== position.x || y !== position.y) {
          neighbors.push({ x, y });
        }
      }
    }

    return neighbors;
  }

  static calculateNeighborPositions(position, bounds) {
    return this.calculateNeighbors(position, bounds);
  }
}