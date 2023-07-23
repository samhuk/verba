import { repeatStr } from "./string"

describe('verba/util/string', () => {
  describe('repeatStr', () => {
    const fn = repeatStr

    test('basic test 1', () => {
      const result = fn('', 0)
      expect(result).toBe('')
    })

    test('basic test 2', () => {
      const result = fn(' ', 0)
      expect(result).toBe('')
    })

    test('basic test 3', () => {
      const result = fn(' ', 1)
      expect(result).toBe(' ')
    })

    test('basic test 4', () => {
      const result = fn(' ', 10)
      expect(result).toBe('          ')
    })
  })
})
