import { writable } from "svelte/store";

// game is true
let gameOrReviewStore = writable(true);

export default gameOrReviewStore;