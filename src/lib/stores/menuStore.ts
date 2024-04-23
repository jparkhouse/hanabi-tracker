import { writable } from 'svelte/store';

export const activeMenuCard = writable<number | null>(null);