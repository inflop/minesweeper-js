"use strict";

export const GAME_CONSTANTS = Object.freeze({
  MOUSE_BUTTONS: Object.freeze({
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
  }),

  BOARD_LIMITS: Object.freeze({
    MIN_SIZE: 5,
    MAX_SIZE: 100,
    MIN_ROWS: 8,
    MIN_COLS: 8,
    MAX_ROWS: 100,
    MAX_COLS: 100
  }),

  MINE_PERCENTAGE: Object.freeze({
    DEFAULT: 15,
    MIN: 10,
    MAX: 30
  }),

  CELL_STATES: Object.freeze({
    HIDDEN: 'hidden',
    REVEALED: 'revealed',
    FLAGGED: 'flagged',
    DISABLED: 'disabled',
    EXPLODED: 'exploded'
  }),

  BOARD_STATES: Object.freeze({
    UNMODIFIED: 0,
    MODIFIED: 1,
    DEMINED: 2,
    EXPLODED: 3
  }),

  GAME_RESULTS: Object.freeze({
    NONE: 0,
    WON: 1,
    LOST: 2
  }),

  EMOJIS: Object.freeze({
    START: '&#128512;',
    LOST: '&#128553;',
    WON: '&#128526;',
    MINE: '&#128163;',
    EXPLOSION: '&#128165;',
    FLAG: '&#128204;',
    WRONG_FLAG: '&#10060;'  // ❌ - Red cross for incorrectly flagged cells
  }),

  CELL_ID_PREFIX: 'cell_',

  TIMER_INTERVAL: 1000, // 1 second

  CSS_CLASSES: Object.freeze({
    CELL: 'cell',
    CELL_CHECKED: 'cell-checked',
    CELL_FLAGGED: 'cell-flagged',
    CELL_DISABLED: 'cell-disabled',
    CELL_EXPLODED: 'cell-exploded'
  })
});