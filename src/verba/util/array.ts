export const ensureArray = <T extends any>(input: T | T[]): T[] => (Array.isArray(input)
  ? input
  : [input])
