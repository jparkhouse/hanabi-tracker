import { writable, get } from "svelte/store";
import { Stack } from "../models/stack";
import { gameConfigStore, type GameConfig } from "./gameConfigStore";
import { resetGameStore } from "./resetGameStore";
import { type GameAction } from "../models/gameActions";

function safeJsonParse<T>(str: string): T | undefined {
  try {
    return JSON.parse(str) as T
  } catch (error) {
    console.error("Error parsing JSON: ", error);
    return undefined
  }
}

// Creating a generic managed store that syncs with local storage and uses a Stack
export function createPersistentStackStore<T>(
  key: string,
  getDefaultData: (config: GameConfig) => T[]
) {
  const localKey = import.meta.env.BASE_URL + "/" + key;

  // Function to update local storage
  function updateLocalStore(stack: Stack<T>) {
    localStorage.setItem(localKey, JSON.stringify(stack));
  }

  // Create a writable store with Stack
  let initialData = getDefaultData(get(gameConfigStore));
  const stack = new Stack<T>();
  initialData.forEach((item) => stack.push(item)); // Populate stack with initial data
  const store = writable(stack);
  const storeSize = writable(0);

  // Initialize with local storage if available
  const storedData = localStorage.getItem(localKey);
  console.log("actionStore data: ", storedData);
  if (storedData) {
    try {
      const debugParsed = safeJsonParse<T[]>(storedData);
      console.log("parsed: ", debugParsed);
      console.log("of Type: ", typeof debugParsed);
    } catch (error) {
      console.error("Error with parsing: ", error)
    }
    const debugTypeParsed: Object = JSON.parse(storedData);
    console.log("parsed with type: ", debugTypeParsed);
    console.log("of Type: ", typeof debugTypeParsed);
  }

  if (storedData && storedData !== "undefined") {
    const items: T[] = JSON.parse(storedData);
    console.log("type of items: ", typeof items)
    const storedDataStack = new Stack<T>();
    items.forEach((item) => storedDataStack.push(item));
    store.set(storedDataStack);
    storeSize.set(get(store).size());
  }

  // Handle resetGameStore changes
  let firstLoad = true;
  resetGameStore.subscribe(() => {
    if (!firstLoad) {
      const defaultData = getDefaultData(get(gameConfigStore));
      store.update((stack) => {
        stack.clear();
        defaultData.forEach((item) => stack.push(item));
        return stack;
      });
      updateLocalStore(get(store));
    } else {
      firstLoad = false;
    }
  });

  // Enhance store with custom stack methods
  return {
    subscribe: store.subscribe,
    push: (item: T) => {
      store.update((stack) => {
        stack.push(item);
        updateLocalStore(stack);
        storeSize.set(stack.size());
        return stack;
      });
    },
    pop: (): T => {
      let poppedItem: T | undefined;
      store.update((stack) => {
        poppedItem = stack.pop()!;
        updateLocalStore(stack);
        storeSize.set(stack.size());
        return stack;
      });
      return poppedItem as T;
    },
    peek: (): T => {
      return get(store).peek();
    },
    clear: () => {
      store.update((stack) => {
        stack.clear();
        updateLocalStore(stack);
        storeSize.set(stack.size());
        return stack;
      });
    },
    size: storeSize,
  };
}

export const actionStore = createPersistentStackStore<GameAction>(
  "actionStore",
  (config: GameConfig) => []
);
