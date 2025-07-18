import { writable } from 'svelte/store';

export const file = writable<File | null>(null);
