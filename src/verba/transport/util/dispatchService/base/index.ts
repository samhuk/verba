import { onUnexpectedExit } from '../../../../util/process'
import { DispatchService, DispatchServiceOptions } from './types'

export const createDispatchService = (options: DispatchServiceOptions): DispatchService => {
  // If no batch interval or size, then return simple instantaneous stream writer
  if (options.batchOptions?.interval == null && options.batchOptions?.size == null) {
    return {
      dispatch: options.dispatch,
      destroy: () => options.destroy?.(),
    }
  }

  const queue = options.createQueue()
  const baseDestroy = async () => {
    await queue.drain()
    await options.destroy?.()
  }

  // If batch interval is only defined, use a timer to decide when to process the queue
  if (options.batchOptions?.interval != null && options.batchOptions.size == null) {
    const interval = setInterval(queue.drain, options.batchOptions.interval)
    const destroy = async () => {
      clearInterval(interval)
      await baseDestroy()
    }
    onUnexpectedExit(destroy)
    return {
      dispatch: s => queue.add(s),
      destroy,
    }
  }
  
  // If batch size is only defined, use the queue length to decide when to process the queue
  if (options.batchOptions.interval == null && options.batchOptions.size != null) {
    const maxQueueSize = options.batchOptions.size
    onUnexpectedExit(baseDestroy)
    return {
      dispatch: s => {
        queue.add(s)
        if (queue.size > maxQueueSize)
          queue.drain()
      },
      destroy: baseDestroy,
    }
  }

  // Else (batch size and interval are both defined), use the queue length
  // and a timer to decide when to process the queue
  const maxQueueSize = options.batchOptions.size as number
  const interval = setInterval(queue.drain, options.batchOptions.interval)
  const destroy = async () => {
    clearInterval(interval)
    await baseDestroy()
  }
  onUnexpectedExit(destroy)
  return {
    dispatch: s => {
      queue.add(s)
      if (queue.size > maxQueueSize)
        queue.drain()
    },
    destroy,
  }
}
