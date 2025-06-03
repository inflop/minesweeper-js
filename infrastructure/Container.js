"use strict";

export class Container {
  #dependencies = new Map();
  #instances = new Map();

  register(key, factory, options = {}) {
    if (typeof factory !== "function") {
      throw new TypeError("Factory must be a function");
    }

    this.#dependencies.set(key, {
      factory,
      singleton: Boolean(options.singleton),
      dependencies: options.dependencies || [],
    });

    return this; // For method chaining
  }

  registerInstance(key, instance) {
    this.#instances.set(key, instance);
    return this;
  }

  resolve(key) {
    // Check if instance already exists
    if (this.#instances.has(key)) {
      return this.#instances.get(key);
    }

    const dependency = this.#dependencies.get(key);
    if (!dependency) {
      throw new Error(
        `Dependency '${key}' not found. Available dependencies: ${Array.from(
          this.#dependencies.keys()
        ).join(", ")}`
      );
    }

    // Resolve dependencies first
    const resolvedDependencies = dependency.dependencies.map((dep) =>
      this.resolve(dep)
    );

    // Create instance
    const instance = dependency.factory(...resolvedDependencies, this);

    // Cache if singleton
    if (dependency.singleton) {
      this.#instances.set(key, instance);
    }

    return instance;
  }

  has(key) {
    return this.#dependencies.has(key) || this.#instances.has(key);
  }

  clear() {
    this.#dependencies.clear();
    this.#instances.clear();
  }

  getRegisteredKeys() {
    return Array.from(this.#dependencies.keys());
  }

  createScope() {
    const scope = new Container();
    // Copy non-singleton dependencies to new scope
    for (const [key, dependency] of this.#dependencies) {
      if (!dependency.singleton) {
        scope.#dependencies.set(key, dependency);
      }
    }
    // Copy singleton instances
    for (const [key, instance] of this.#instances) {
      scope.#instances.set(key, instance);
    }
    return scope;
  }
}
