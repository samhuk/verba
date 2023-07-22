import { Listener, ListenerStore } from './types'

/**
 * Responsible for storing listeners for arbitrary event names.
 * 
 * @example
 * const listenerStore = createListenerStore<
 *   'foo' | 'bar',
 *   {
 *     foo: (arg1: string, arg2: number) => boolean,
 *     bar: (arg1: string, arg2: number) => boolean,
 *   }
 * >()
 */
export const createListenerStore = <
  TEventNames extends string = string,
  TEventHandlerMap extends { [k in TEventNames]: (...args: any[]) => any } = { [k in TEventNames]: (...args: any[]) => any }
>(): ListenerStore<TEventNames, TEventHandlerMap> => {
  let instance: ListenerStore<TEventNames>
  let nextId = 0

  return instance = {
    count: 0,
    listeners: {},
    eventNameToListeners: {} as any,
    call: (eventName, ...args) => {
      const listenersToCall = Object.values(instance.eventNameToListeners[eventName] ?? {})
      const listenersToRemove = listenersToCall.filter(l => l.removeOnceCalled)

      listenersToCall.forEach(l => l.handler(...args))
      listenersToRemove.forEach(l => instance.remove(l.id))
    },
    // @ts-ignore
    add: (eventName, handler, options) => {
      const listener: Listener<TEventNames> = {
        id: options?.id ?? String(nextId),
        eventName,
        handler,
        removeOnceCalled: options?.removeOnceCalled ?? false,
      }
      nextId += 1
      if (instance.eventNameToListeners[eventName] == null)
        instance.eventNameToListeners[eventName] = {}

      instance.listeners[listener.id] = listener;
      (instance.eventNameToListeners[eventName][listener.id] as any) = listener
      instance.count += 1
      return listener.id
    },
    remove: uuid => {
      const listener = instance.listeners[uuid]
      if (listener == null)
        return

      delete instance.eventNameToListeners[listener.eventName][uuid]
      delete instance.listeners[uuid]
      instance.count -= 1
    },
    removeByEventName: eventName => {
      const listenerUuidsToRemove = Object.keys(instance.eventNameToListeners[eventName] ?? {})
      for (let i = 0; i < listenerUuidsToRemove.length; i += 1) {
        const listenerUuid = listenerUuidsToRemove[i]
        delete instance.listeners[listenerUuid]
        instance.eventNameToListeners[eventName] = {}
      }

      instance.count -= listenerUuidsToRemove.length
    },
  }
}