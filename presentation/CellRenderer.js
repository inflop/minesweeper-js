"use strict";

import {
  HiddenCellStrategy,
  FlaggedCellStrategy,
  ExplodedMineStrategy,
  RevealedMineStrategy,
  NumberCellStrategy,
  EmptyCellStrategy,
  DisabledCellStrategy,
  WrongFlagStrategy,
} from "./strategies/CellRenderingStrategy.js";

export class CellRenderer {
  #strategies;

  constructor(gameOverService) {
    // Order matters - more specific strategies should come first
    this.#strategies = [
      new WrongFlagStrategy(gameOverService), // Wrong flags have highest priority (must override disabled)
      new DisabledCellStrategy(), // Check disabled first as it overrides other states
      new ExplodedMineStrategy(), // Exploded mines have priority
      new FlaggedCellStrategy(), // Flagged cells override revealed state
      new RevealedMineStrategy(), // Revealed mines
      new NumberCellStrategy(), // Number cells (revealed with mine neighbors)
      new EmptyCellStrategy(), // Empty cells (revealed without mine neighbors)
      new HiddenCellStrategy(), // Hidden cells (fallback)
    ];
  }
  render(cell) {
    const strategy = this.#findStrategy(cell);
    if (!strategy) {
      console.warn(`No rendering strategy found for cell: ${cell.toString()}`);
      return { content: "", className: "cell" };
    }

    const result = {
      content: strategy.render(cell),
      className: strategy.getClassName(cell),
    };

    return result;
  }

  renderContent(cell) {
    return this.render(cell).content;
  }

  renderClassName(cell) {
    return this.render(cell).className;
  }

  #findStrategy(cell) {
    return this.#strategies.find((strategy) => strategy.canHandle(cell));
  }

  // Method to add custom strategies
  addStrategy(strategy, position = -1) {
    if (position === -1) {
      this.#strategies.push(strategy);
    } else {
      this.#strategies.splice(position, 0, strategy);
    }
  }

  // Method to remove strategies
  removeStrategy(strategyClass) {
    this.#strategies = this.#strategies.filter(
      (strategy) => !(strategy instanceof strategyClass)
    );
  }

  // Method to get all available strategies
  getStrategies() {
    return [...this.#strategies];
  }
}
