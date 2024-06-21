import { createPersistentStore } from "../persistentStore";
import { writable, get } from "svelte/store";

class LocalStorageMock {
  store: Record<string, string>;
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

// You can now replace the global localStorage object with this mock in your tests
(globalThis as any).localStorage = new LocalStorageMock();

describe("createPersistentStore", () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
    (globalThis as any).localStorage = localStorageMock;
    process.env.BASE_URL = '/test'; // Mock BASE_URL
  });

  afterEach(() => {
    localStorageMock.clear();
    delete process.env.BASE_URL; // Clean up mock
  });

  describe("Initialization", () => {
    it("should set the correct local storage key based on BASE_URL and provided key", () => {
      // arrange
      const testStore = createPersistentStore<number>('testKey', 0);
      // act
      const result = localStorageMock.getItem('/test/testKey');
      // assert
      expect(result).toEqual('0');
    });
/* 
    it("should initialize the store with the start value if no stored value is found", () => {
      // Test when local storage does not have the key
    });

    it("should initialize the store with the stored value if it exists", () => {
      // Test when local storage has a key and value
    });
  });

  describe("updateLocalStore", () => {
    it("should update local storage with the current store value", () => {
      // Test if local storage gets updated correctly
    });
  });

  describe("Store Methods", () => {
    let store;

    beforeEach(() => {
      store = createPersistentStore("testKey", "startValue");
    });

    describe("subscribe", () => {
      it("should subscribe to store changes", () => {
        // Test subscription functionality
      });
    });

    describe("set", () => {
      it("should update the store value and local storage", () => {
        // Test setting a new value and checking store and local storage
      });
    });

    describe("get", () => {
      it("should return the current value from local storage", () => {
        // Test getting the value from local storage
      });
    });

    describe("reset", () => {
      it("should reset the store to the start value if no reset value function is provided", () => {
        // Test reset without getResetValue
      });

      it("should reset the store to the reset value if reset value function is provided", () => {
        // Test reset with getResetValue
      });
    });
  });

  describe("resetGameStore Subscription", () => {
    it("should reset the store value on resetGameStore change after the first load", () => {
      // Test reset functionality on resetGameStore change
    });

    it("should not reset the store value on the first load", () => {
      // Test that the store is not reset on first load
    }); */
  });
});
