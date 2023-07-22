import { createListenerStore } from '.'

describe('listenerStore', () => {
  describe('createListenerStore', () => {
    const fn = createListenerStore

    test('basic test', () => {
      // -- Act
      const instance = fn()

      // -- Assert
      expect(instance.listeners).toEqual({})
      expect(instance.eventNameToListeners).toEqual({})
      expect(instance.count).toBe(0)

      const handler = () => {}

      // -- Act
      instance.add('event1', handler, { id: 'a' })
      instance.add('event2', handler, { id: 'b' })
      instance.add('event3', handler, { id: 'c' })
      instance.add('event1', handler, { id: 'd' })
      instance.add('event2', handler, { id: 'e' })
      instance.add('event3', handler, { id: 'f' })

      // -- Assert
      expect(instance.listeners).toEqual({
        a: { id: 'a', eventName: 'event1', handler, removeOnceCalled: false },
        b: { id: 'b', eventName: 'event2', handler, removeOnceCalled: false },
        c: { id: 'c', eventName: 'event3', handler, removeOnceCalled: false },
        d: { id: 'd', eventName: 'event1', handler, removeOnceCalled: false },
        e: { id: 'e', eventName: 'event2', handler, removeOnceCalled: false },
        f: { id: 'f', eventName: 'event3', handler, removeOnceCalled: false },
      })
      expect(instance.eventNameToListeners).toEqual({
        event1: {
          a: { id: 'a', eventName: 'event1', handler, removeOnceCalled: false },
          d: { id: 'd', eventName: 'event1', handler, removeOnceCalled: false },
        },
        event2: {
          b: { id: 'b', eventName: 'event2', handler, removeOnceCalled: false },
          e: { id: 'e', eventName: 'event2', handler, removeOnceCalled: false },
        },
        event3: {
          c: { id: 'c', eventName: 'event3', handler, removeOnceCalled: false },
          f: { id: 'f', eventName: 'event3', handler, removeOnceCalled: false },
        },
      })
      expect(instance.count).toBe(6)

      // -- Act
      instance.remove('a')
      instance.remove('c')
      instance.remove('d')

      // -- Assert
      expect(instance.listeners).toEqual({
        b: { id: 'b', eventName: 'event2', handler, removeOnceCalled: false },
        e: { id: 'e', eventName: 'event2', handler, removeOnceCalled: false },
        f: { id: 'f', eventName: 'event3', handler, removeOnceCalled: false },
      })
      expect(instance.eventNameToListeners).toEqual({
        event1: { },
        event2: {
          b: { id: 'b', eventName: 'event2', handler, removeOnceCalled: false },
          e: { id: 'e', eventName: 'event2', handler, removeOnceCalled: false },
        },
        event3: {
          f: { id: 'f', eventName: 'event3', handler, removeOnceCalled: false },
        },
      })
      expect(instance.count).toBe(3)

      // -- Act
      const recievedArgValues: number[] = []
      const testHandler = (...args: any[]) => recievedArgValues.push(...args)
      const id = instance.add('event1', testHandler)

      // -- Assert
      expect(id).toBeDefined()
      instance.call('event1', 1, 2, 3)

      expect(recievedArgValues).toEqual([1, 2, 3])
    })

    test('removeOnceCalled = true', () => {
      const instance = fn()

      let timesCalled = 0
      instance.add('event1', () => timesCalled += 1, { removeOnceCalled: true })

      instance.call('event1')

      expect(timesCalled).toBe(1)
      expect(instance.count).toBe(0)

      instance.call('event1')

      expect(timesCalled).toBe(1)
      expect(instance.count).toBe(0)
    })

    test('types', () => {
      type TestEventNames = 'event1' | 'event2'
      type TestEventHandlerMap = { event1: (s: string, n: number) => void, event2: (n: number, s: string) => void }

      const instance = fn<TestEventNames, TestEventHandlerMap>()

      // -- Event 1
      // @ts-expect-error
      instance.call('event1', 1, 2) // Wrong arg type
      // @ts-expect-error
      instance.call('event1', '1', 2, 3) // Too many args
      // @ts-expect-error
      instance.call('event1', '1') // Too few args

      instance.call('event1', '1', 2) // Correct args

      // -- Event 2
      // @ts-expect-error
      instance.call('event2', 1, 2)
      // @ts-expect-error
      instance.call('event2', 1, '2', 3)
      // @ts-expect-error
      instance.call('event2', 1)
      instance.call('event2', 1, '2')

      expect(true).toBe(true) // Dummy
    })
  })
})
