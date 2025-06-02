"use strict";

import { GAME_CONSTANTS } from '../../common/GameConstants.js';

export class CellRenderingStrategy {
  canHandle(cell) {
    throw new Error('canHandle method must be implemented');
  }

  render(cell) {
    throw new Error('render method must be implemented');
  }
  getClassName(cell) {
    return 'cell';  // Base cell class required for CSS styling
  }
}

export class HiddenCellStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return cell.isHidden;
  }

  render(cell) {
    return '';
  }
  getClassName(cell) {
    return 'cell';  // Hidden cells get base cell styling
  }
}

export class FlaggedCellStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return cell.isFlagged;
  }

  render(cell) {
    return GAME_CONSTANTS.EMOJIS.FLAG;
  }
  getClassName(cell) {
    return 'cell flagged';
  }
}

export class ExplodedMineStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return cell.containsMine && cell.isExploded;
  }

  render(cell) {
    return GAME_CONSTANTS.EMOJIS.EXPLOSION;
  }  getClassName(cell) {
    return 'cell mined exploded';
  }
}

export class RevealedMineStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return cell.containsMine && cell.isRevealed && !cell.isExploded;
  }

  render(cell) {
    return GAME_CONSTANTS.EMOJIS.MINE;
  }  getClassName(cell) {
    return 'cell mined checked';
  }
}

export class NumberCellStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return !cell.containsMine && cell.isRevealed && cell.hasMinedNeighbors;
  }

  render(cell) {
    return cell.neighborMineCount.toString();
  }
  getClassName(cell) {
    return `cell checked number-${cell.neighborMineCount}`;
  }
}

export class EmptyCellStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return !cell.containsMine && cell.isRevealed && !cell.hasMinedNeighbors;
  }

  render(cell) {
    return '';
  }
  getClassName(cell) {
    return 'cell checked';
  }
}

export class WrongFlagStrategy extends CellRenderingStrategy {
  #gameOverService;

  constructor(gameOverService) {
    super();
    this.#gameOverService = gameOverService;
  }

  canHandle(cell) {
    return this.#gameOverService?.isCellWrongFlag(cell.id) ?? false;
  }

  render(cell) {
    return GAME_CONSTANTS.EMOJIS.WRONG_FLAG;
  }

  getClassName(cell) {
    return 'cell wrong-flag';
  }
}

export class DisabledCellStrategy extends CellRenderingStrategy {
  canHandle(cell) {
    return cell.isDisabled;
  }

  render(cell) {
    if (cell.containsMine) {
      return cell.isExploded ? GAME_CONSTANTS.EMOJIS.EXPLOSION : GAME_CONSTANTS.EMOJIS.MINE;
    }
    return cell.hasMinedNeighbors ? cell.neighborMineCount.toString() : '';
  }  getClassName(cell) {
    return cell.containsMine ? 'cell mined disabled' : 'cell checked disabled';
  }
}