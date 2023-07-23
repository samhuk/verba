import { ensureArray } from "./array"

describe('verba/util/array', () => {
  describe('ensureArray', () => {
    const fn = ensureArray

    test('basic test 1', () => {
      const result = fn(1)
      expect(result).toEqual([1])
    })

    test('basic test 2', () => {
      const result = fn([1])
      expect(result).toEqual([1])
    })

    test('basic test 3', () => {
      const result = fn(null)
      expect(result).toEqual([null])
    })

    test('basic test 4', () => {
      const result = fn(undefined)
      expect(result).toEqual([undefined])
    })

    test('basic test 5', () => {
      const result = fn([1, 2, 3])
      expect(result).toEqual([1, 2, 3])
    })
  })
})
