import * as fs from 'fs'

import { FileTransportBatchOptions, FileTransportOutFile } from './types'

type FileTransportDispatchService = {
  dispatch: (s: string) => void
  close: () => Promise<void>
}

const onUnexpectedExit = (fn: () => Promise<void> | void): void => {
  process.once('beforeExit', fn)
}

const closeStream = (writeStream: fs.WriteStream) => new Promise<void>(res => {
  writeStream.close(() => res())
})

const createMessageQueue = (writeStream: fs.WriteStream) => {
  let logMessageQueue: string[]
  let instance: { size: number, add: (s: string) => void, drain: () => Promise<void> }

  return instance = {
    size: 0,
    add: (s: string) => instance.size = logMessageQueue.push(s),
    drain: () => new Promise<void>(res => {
      writeStream.write(logMessageQueue.join('\n'), () => {
        logMessageQueue = []
        instance.size = 0
        res()
      })
    }),
  }
}

export const createFileTransportDispatchService = (
  outFile: FileTransportOutFile,
  batchOptions?: FileTransportBatchOptions,
): FileTransportDispatchService => {
  const writeStream = typeof outFile === 'string'
    ? fs.createWriteStream(outFile, {flags : 'w'})
    : outFile

  // If no batch interval or size, then return simple instantaneous stream writer
  if (batchOptions?.interval == null && batchOptions?.size == null) {
    return {
      dispatch: s => writeStream.write(s + '\n'),
      close: () => closeStream(writeStream),
    }
  }

  const queue = createMessageQueue(writeStream)
  const baseClose = async () => {
    await queue.drain()
    await closeStream(writeStream)
  }

  // If batch interval is only defined, use a timer to decide when to process the queue
  if (batchOptions.interval != null && batchOptions.size == null) {
    const interval = setInterval(queue.drain, batchOptions.interval)
    const close = async () => {
      clearInterval(interval)
      await baseClose()
    }
    onUnexpectedExit(close)
    return {
      dispatch: s => queue.add(s),
      close,
    }
  }
  
  // If batch size is only defined, use the queue length to decide when to process the queue
  if (batchOptions.interval == null && batchOptions.size != null) {
    const maxQueueSize = batchOptions.size
    onUnexpectedExit(baseClose)
    return {
      dispatch: s => {
        queue.add(s)
        if (queue.size < maxQueueSize)
          queue.drain()
      },
      close: baseClose,
    }
  }

  // Else (batch size and i are both defined), use the queue length and a timer
  // to decide when to process the queue
  const maxQueueSize = batchOptions.size as number
  const interval = setInterval(queue.drain, batchOptions.interval)
  const close = async () => {
    clearInterval(interval)
    await baseClose()
  }
  onUnexpectedExit(close)
  return {
    dispatch: s => {
      queue.add(s)
      if (queue.size < maxQueueSize)
        queue.drain()
    },
    close,
  }
}
