"use strict";

export class TypeGuards {
  static isValidPosition(position) {
    return (
      position &&
      typeof position.x === "number" &&
      typeof position.y === "number" &&
      Number.isInteger(position.x) &&
      Number.isInteger(position.y) &&
      position.x >= 0 &&
      position.y >= 0
    );
  }

  static isValidCellId(cellId) {
    return typeof cellId === "string" && cellId.trim().length > 0;
  }

  static isValidBounds(bounds) {
    return (
      bounds &&
      typeof bounds.rows === "number" &&
      typeof bounds.cols === "number" &&
      Number.isInteger(bounds.rows) &&
      Number.isInteger(bounds.cols) &&
      bounds.rows > 0 &&
      bounds.cols > 0
    );
  }

  static isValidMineCount(mineCount, totalCells) {
    return (
      typeof mineCount === "number" &&
      Number.isInteger(mineCount) &&
      mineCount >= 0 &&
      mineCount < totalCells
    );
  }

  static isString(value) {
    return typeof value === "string";
  }

  static isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }

  static isFunction(value) {
    return typeof value === "function";
  }

  static isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
}
