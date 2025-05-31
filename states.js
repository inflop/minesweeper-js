"use strict";

export const BoardState = {
  UNMODIFIED: 0,
  MODIFIED: 1,
  DEMINED: 2,
  EXPLODED: 3
};

export const GameResult = {
  NONE: 0,
  WON: 1,
  LOST: 2
};

export const CellState = {
  HIDDEN: 0,
  CHECKED: 1,
  FLAGGED: 2,
  DISABLED: 3,
  REVEALED: 4
};
