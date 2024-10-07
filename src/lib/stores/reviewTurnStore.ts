import { writable } from "svelte/store";

// game is true
let reviewTurnStore = writable(0);

export default reviewTurnStore;