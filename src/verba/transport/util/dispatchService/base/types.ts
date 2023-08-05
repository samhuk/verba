export type DispatchService = {
  dispatch: (s: string) => void
  destroy: () => Promise<void> | void
}

export type DispatchServiceQueue = {
  size: number
  add: (s: string) => void
  drain: () => Promise<void>
}

export type DispatchServiceOptions = {
  dispatch: (s: string) => void
  destroy?: () => Promise<void>
  createQueue: () => DispatchServiceQueue
  batchOptions: DispatchServiceBatchOptions | undefined
}

/**
 * Options to configure the batching behavior of the File Transport.
 */
export type DispatchServiceBatchOptions = {
  /**
   * How often to dispatch queued log messages.
   */
  interval?: number
  /**
   * The size of a log message batch before it is dispatched.
   */
  size?: number
}
