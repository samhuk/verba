export type Listener<
  TEventNames extends string = string
> = {
  eventName: TEventNames
  id: string
  handler: (...args: any) => any
  removeOnceCalled: boolean
}

export type UuidToListenerDict<
  TEventNames extends string = string
> = {
  [id: string]: Listener<TEventNames>
}

export type EventNameToListenersDict<
  TEventNames extends string = string
> = {
  [eventName in TEventNames]: UuidToListenerDict<TEventNames>
}

export type ListenerStore<
  TEventNames extends string = string,
  TEventHandlerMap extends { [k in TEventNames]: (...args: any[]) => any } = { [k in TEventNames]: (...args: any[]) => any }
> = {
  count: number
  listeners: UuidToListenerDict<TEventNames>
  eventNameToListeners: EventNameToListenersDict<TEventNames>
  call: <TTEventName extends TEventNames>(eventName: TTEventName, ...args: Parameters<TEventHandlerMap[TTEventName]>) => void
  /**
   * @returns Listener ID
   */
  add: <TTEventName extends TEventNames>(
    eventName: TTEventName,
    handler: (...args: Parameters<TEventHandlerMap[TTEventName]>) => void,
    options?: {
      id?: string,
      removeOnceCalled?: boolean
    }
  ) => string
  remove: (id: string) => void
  removeByEventName: (eventName: TEventNames) => void
}
