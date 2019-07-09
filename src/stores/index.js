import {writable} from 'svelte/store'

export const username = writable(null)
export const lastKey = writable(null)
export const hasKey = writable(null)
export const isPlaying = writable(true)
