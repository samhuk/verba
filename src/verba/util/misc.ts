import { MutableRef } from './types'

/**
 * Creates an object that contains the `initialValue` that can be modified. This can be useful
 * for creating and passing around mutable state.
 * 
 * Note that this is generally not a good practice, but sometimes is the simplest and most
 * convenient "just works" solution.
 * 
 * @example useRef<number>(1) // { current: 1 }
 */
export const useRef = <T>(initialValue: T): MutableRef<T> => ({
  current: initialValue,
})
