// /lib/stores/resetGameStore.ts

import { writable } from "svelte/store";

export const resetGameStore = writable<number>(0)