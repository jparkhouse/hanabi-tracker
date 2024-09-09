import { writable, get } from "svelte/store";
import { Stack } from "../models/stack";
import { gameConfigStore } from "./gameConfigStore";
import { type GameAction } from "../models/gameActions";

function createActionStore() {
  const localKey = import.meta.env.BASE_URL + "/actionStore";

  // Function to update local storage
  function updateLocalStore(stack: Stack<GameAction>) {
    try {
      localStorage.setItem(localKey, stack.toJSON());
    } catch (error) {
      console.error("Error saving to local storage", error);
    }
  }

  // Create a writable store with Stack<GameAction>
  const stack = new Stack<GameAction>();
  const store = writable(stack);
  const storeSize = writable(0);

  // Initialize with local storage if available
  const storedData = localStorage.getItem(localKey);
  if (storedData) {
    try {
      stack.fromJSON(storedData); // Use fromJSON to populate the stack
      store.set(stack);
      storeSize.set(stack.size());
    } catch (error) {
      console.error("Error loading actionStore from local storage: ", error);
    }
  }

  // Handle resetGameStore changes (if still needed)
  let firstLoad = true;
  gameConfigStore.subscribe(() => {
    if (!firstLoad) {
      // Clear the stack on game reset
      store.update(stack => {
        stack.clear();
        updateLocalStore(stack);
        storeSize.set(stack.size());
        return stack;
      });
    } else {
      firstLoad = false;
    }
  });

  // Enhance store with custom stack methods
  return {
    subscribe: store.subscribe,
    push: (action: GameAction) => {
      store.update((stack) => {
        stack.push(action);
        updateLocalStore(stack);
        storeSize.set(stack.size());
        return stack;
      });
    },
    pop: (): GameAction | undefined => {
      let poppedAction: GameAction | undefined;
      store.update((stack) => {
        poppedAction = stack.pop();
        updateLocalStore(stack);
        storeSize.set(stack.size());
        return stack;
      });
      return poppedAction;
    },
    peek: (): GameAction | undefined => {
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
    getAllActions: (): GameAction[] => {
      return get(store).get(); // Direct access to all actions for replay functionality
    },
    size: storeSize,
  };
}

export const actionStore = createActionStore();
