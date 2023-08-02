import { createIndentationString } from "./indentation"

/**
 * Repeats the given string `s`, `n` times.
 * 
 * @example
 * repeatStr('-', 5) // "-----"
 */
export const repeatStr = (s: string, n: number): string => {
  let result = ''
  for (let i = 0; i < n; i += 1)
    result += s
  return result
}

export const createPadder = (n: number) => (s: string): string => {
  const numMissing = n - s.length
  return numMissing <= 0
    ? s
    : s + createIndentationString(numMissing)
}
