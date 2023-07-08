export const repeatStr = (s: string, n: number): string => {
  let result = ''
  for (let i = 0; i < n; i += 1)
    result += s
  return result
}
