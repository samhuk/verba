export type Observable = {
  broadcast: () => Promise<void[]>,
  subscribe: (fn: () => (Promise<void> | void)) => void
}

export const createObservable = (): Observable => {
  const subscribers: (() => (Promise<void> | void))[] = []
  return {
    subscribe: fn => subscribers.push(fn),
    broadcast: () => Promise.all(subscribers.map(fn => fn())),
  }
}
