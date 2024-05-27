import { writable, get } from 'svelte/store';
import { type GameConfig, gameConfigStore } from './gameConfigStore';  // Import your gameConfig store
import { DataManager } from '../models/dataManager';

export function createManagedInformationStore<T>(key: string, getDefaultData: (config: GameConfig) => T) {
    const localKey = import.meta.env.BASE_URL + '/' + key;
    
    // Create a writable store
    let initialData = getDefaultData(get(gameConfigStore));
    const dataManager = new DataManager<T>(initialData);
    const store = writable(dataManager);

    // Initialize with local storage if available
    const storedData = localStorage.getItem(localKey);
    if (storedData) {
        store.set(new DataManager<T>(JSON.parse(storedData)));
    }

    // Subscribe to gameConfig changes
    gameConfigStore.subscribe($gameConfigStore => {
        const defaultData = getDefaultData($gameConfigStore);
        store.set(new DataManager<T>(defaultData));
    });

    // Enhance store with custom methods and handle local storage updates
    return {
        subscribe: store.subscribe,
        set: (id: number, data: T) => {
            store.update(currentManager => {
                currentManager.set(id, data);
                return currentManager;
            });
        },
        get: (id: number) => {
            let currentManager = get(store);
            return currentManager.get(id);
        },
        reset: () => {
            const defaultData = getDefaultData(get(gameConfigStore));
            store.set(new DataManager<T>(defaultData));
        }
    };
}
