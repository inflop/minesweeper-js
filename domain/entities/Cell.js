"use strict";

import { TypeGuards } from '../../common/TypeGuards.js';
import { GAME_CONSTANTS } from '../../common/GameConstants.js';
import { Result } from '../../common/Result.js';

export class Cell {
  #id;
  #containsMine;
  #position;
  #state;
  #neighborMineCount;

  constructor(id, containsMine = false, position = null) {
    if (!TypeGuards.isValidCellId(id)) {
      throw new TypeError("Cell ID must be a non-empty string");
    }

    this.#id = id;
    this.#containsMine = Boolean(containsMine);
    this.#position = position;
    this.#state = GAME_CONSTANTS.CELL_STATES.HIDDEN;
    this.#neighborMineCount = 0;
  }

  get id() {
    return this.#id;
  }

  get containsMine() {
    return this.#containsMine;
  }

  get isMined() { // Backward compatibility
    return this.#containsMine;
  }

  get position() {
    return this.#position;
  }

  set position(position) {
    this.#position = position;
  }

  get state() {
    return this.#state;
  }

  get neighborMineCount() {
    return this.#neighborMineCount;
  }

  get minedNeighborsNumber() { // Backward compatibility
    return this.#neighborMineCount;
  }

  get hasMinedNeighbors() {
    return this.#neighborMineCount > 0;
  }

  // State checks
  get isHidden() {
    return this.#state === GAME_CONSTANTS.CELL_STATES.HIDDEN;
  }

  get isRevealed() {
    return this.#state === GAME_CONSTANTS.CELL_STATES.REVEALED;
  }

  get isFlagged() {
    return this.#state === GAME_CONSTANTS.CELL_STATES.FLAGGED;
  }

  get isDisabled() {
    return this.#state === GAME_CONSTANTS.CELL_STATES.DISABLED;
  }

  get isExploded() {
    return this.#state === GAME_CONSTANTS.CELL_STATES.EXPLODED;
  }


  // Backward compatibility getters
  get flagged() {
    return this.isFlagged;
  }

  get checked() {
    return this.isRevealed;
  }

  get disabled() {
    return this.isDisabled;
  }

  get revealed() {
    return this.isRevealed;
  }

  get exploded() {
    return this.isExploded;
  }

  // Domain methods
  setNeighborMineCount(count) {
    if (this.#containsMine) {
      return Result.failure('Cannot set neighbor mine count on a mine cell');
    }
    if (!TypeGuards.isNumber(count) || count < 0 || count > 8) {
      return Result.failure('Neighbor mine count must be between 0 and 8');
    }

    this.#neighborMineCount = count;
    return Result.success(count);
  }

  setAsMine() {
    if (this.#containsMine) {
      return Result.failure('Cell already contains a mine');
    }

    this.#containsMine = true;
    this.#neighborMineCount = 0; // Reset neighbor count for mine cells
    return Result.success({ cellId: this.#id });
  }

  // Backward compatibility setter
  set minedNeighborsNumber(value) {
    const result = this.setNeighborMineCount(value || 0);
    if (result.isFailure) {
      throw new Error(result.error);
    }
  }

  reveal() {
    if (this.isDisabled) {
      return Result.failure('Cannot reveal disabled cell');
    }
    if (this.isRevealed) {
      return Result.failure('Cell is already revealed');
    }
    if (this.isFlagged) {
      return Result.failure('Cannot reveal flagged cell');
    }

    this.#state = GAME_CONSTANTS.CELL_STATES.REVEALED;
    return Result.success({
      cellId: this.#id,
      containsMine: this.#containsMine,
      neighborMineCount: this.#neighborMineCount
    });
  }

  // Backward compatibility method
  check() {
    const result = this.reveal();
    if (result.isFailure) {
      throw new Error(result.error);
    }
  }

  toggleFlag() {
    if (this.isDisabled) {
      return Result.failure('Cannot flag disabled cell');
    }
    if (this.isRevealed) {
      return Result.failure('Cannot flag revealed cell');
    }

    if (this.isFlagged) {
      this.#state = GAME_CONSTANTS.CELL_STATES.HIDDEN;
      return Result.success({ action: 'unflagged', cellId: this.#id });
    } else {
      this.#state = GAME_CONSTANTS.CELL_STATES.FLAGGED;
      return Result.success({ action: 'flagged', cellId: this.#id });
    }
  }

  disable() {
    this.#state = GAME_CONSTANTS.CELL_STATES.DISABLED;
    return Result.success({ cellId: this.#id });
  }

  explode() {
    if (!this.#containsMine) {
      return Result.failure('Only mine cells can explode');
    }

    this.#state = GAME_CONSTANTS.CELL_STATES.EXPLODED;
    return Result.success({ cellId: this.#id });
  }


  canBeRevealed() {
    return this.isHidden && !this.isDisabled;
  }

  canBeFlagged() {
    return (this.isHidden || this.isFlagged) && !this.isDisabled;
  }

  equals(other) {
    if (!(other instanceof Cell)) {
      return false;
    }
    return this.#id === other.id;
  }

  clone() {
    const cloned = new Cell(this.#id, this.#containsMine, this.#position);
    cloned.#state = this.#state;
    cloned.#neighborMineCount = this.#neighborMineCount;
    return cloned;
  }

  toString() {
    return `Cell(${this.#id}, mine: ${this.#containsMine}, state: ${this.#state})`;
  }
}