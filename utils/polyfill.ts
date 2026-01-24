// Polyfill localStorage for Node.js/SSR/Web environments where it is missing or broken
(function () {
  try {
    var globalAny =
      typeof global !== "undefined"
        ? global
        : typeof window !== "undefined"
          ? window
          : typeof self !== "undefined"
            ? self
            : typeof globalThis !== "undefined"
              ? globalThis
              : this;

    // Check if localStorage is missing or if getItem is not a function (broken)
    var isBroken =
      typeof globalAny.localStorage === "undefined" ||
      (globalAny.localStorage &&
        typeof globalAny.localStorage.getItem !== "function");

    if (isBroken) {
      console.log("Polyfilling localStorage...");
      var storage = new Map();
      var memoryStorage = {
        getItem: function (key: any) {
          return storage.get(key) || null;
        },
        setItem: function (key: any, value: any) {
          storage.set(key, String(value));
        },
        removeItem: function (key: any) {
          storage.delete(key);
        },
        clear: function () {
          storage.clear();
        },
        key: function (i: any) {
          return Array.from(storage.keys())[i] || null;
        },
        get length() {
          return storage.size;
        },
      };

      // Define on global object
      try {
        globalAny.localStorage = memoryStorage;
      } catch (e) {}

      // Try to define on window if it exists and is different from global
      if (typeof window !== "undefined" && window !== globalAny) {
        try {
          Object.defineProperty(window, "localStorage", {
            value: memoryStorage,
            configurable: true,
            writable: true,
          });
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn("Failed to polyfill localStorage:", err);
  }
})();
