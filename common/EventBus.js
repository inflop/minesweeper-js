"use strict";

export class GameEvent {
  constructor(type, data, timestamp = new Date()) {
    this.type = type;
    this.data = data;
    this.timestamp = timestamp;
  }
}

export class CellRevealedEvent extends GameEvent {
  constructor(cellData) {
    super("cell-revealed", cellData);
  }
}

export class CellFlaggedEvent extends GameEvent {
  constructor(cellData) {
    super("cell-flagged", cellData);
  }
}

export class GameStartedEvent extends GameEvent {
  constructor() {
    super("game-started", {});
  }
}

export class GameWonEvent extends GameEvent {
  constructor(stats) {
    super("game-won", stats);
  }
}

export class GameLostEvent extends GameEvent {
  constructor(stats) {
    super("game-lost", stats);
  }
}

export class FirstMoveEvent extends GameEvent {
  constructor(data) {
    super("first-move", data);
  }
}

export class BoardStateChangedEvent extends GameEvent {
  constructor(boardState) {
    super("board-state-changed", boardState);
  }
}

export class EventBus {
  #listeners = new Map();

  subscribe(eventType, handler) {
    if (typeof handler !== "function") {
      throw new TypeError("Event handler must be a function");
    }

    if (!this.#listeners.has(eventType)) {
      this.#listeners.set(eventType, new Set());
    }
    this.#listeners.get(eventType).add(handler);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler);
  }

  unsubscribe(eventType, handler) {
    const handlers = this.#listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.#listeners.delete(eventType);
      }
    }
  }

  publish(event) {
    if (!(event instanceof GameEvent)) {
      throw new TypeError("Event must be an instance of GameEvent");
    }

    const handlers = this.#listeners.get(event.type) || new Set();
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  clear() {
    this.#listeners.clear();
  }

  getListenerCount(eventType) {
    return this.#listeners.get(eventType)?.size || 0;
  }
}
