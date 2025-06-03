"use strict";

export class Result {
  #value;
  #error;
  #isSuccess;

  constructor(value, error, isSuccess) {
    this.#value = value;
    this.#error = error;
    this.#isSuccess = isSuccess;
  }

  static success(value) {
    return new Result(value, null, true);
  }

  static failure(error) {
    return new Result(null, error, false);
  }

  get isSuccess() {
    return this.#isSuccess;
  }

  get isFailure() {
    return !this.#isSuccess;
  }

  get value() {
    if (!this.#isSuccess) {
      throw new Error("Cannot access value of failed result");
    }
    return this.#value;
  }

  get error() {
    if (this.#isSuccess) {
      throw new Error("Cannot access error of successful result");
    }
    return this.#error;
  }

  map(fn) {
    return this.#isSuccess ? Result.success(fn(this.#value)) : this;
  }

  flatMap(fn) {
    return this.#isSuccess ? fn(this.#value) : this;
  }

  match({ success, failure }) {
    return this.#isSuccess ? success(this.#value) : failure(this.#error);
  }

  getValueOrElse(defaultValue) {
    return this.#isSuccess ? this.#value : defaultValue;
  }
}
