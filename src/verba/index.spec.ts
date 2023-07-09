import { createVerbaLogger } from '.'

describe('verba', () => {
  describe('createVerbaLogger', () => {
    const fn = createVerbaLogger

    test('basic test', () => {
      const instance = fn()
      expect(instance).toBeDefined()
    })
  })
})
