export const ensureArray = <T extends any>(input: T | T[]): T[] => (Array.isArray(input)
  ? input
  : [input])

export const repeat = <T extends any>(item: T, n: number): T[] => {
  const result = []
  for (let i = 0; i < n; i += 1)
    result.push(item)
  return result
}
