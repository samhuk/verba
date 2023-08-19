import { createVerba } from '.'

describe('verba', () => {
  describe('createVerba', () => {
    const fn = createVerba

    test('basic test', () => {
      const instance = fn()
      expect(instance).toBeDefined()
    })
  })
})
