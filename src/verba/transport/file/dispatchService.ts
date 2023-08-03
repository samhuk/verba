import * as fs from 'fs'

import { CloseNotifier, FileTransportBatchOptions, FileTransportOutFile } from './types'

type FileTransportDispatchService = {
  dispatch: (s: string) => void
  close: () => Promise<void>
}

const onImplicitExit = (fn: () => Promise<void> | void): void => {
  process.once('beforeExit', fn)
}

const createLogMessageQueueTimer = (
  batchAge: number,
) => {
  let shouldProcess = false

  const interval = setInterval(() => {
    shouldProcess = true
  }, batchAge)
  onImplicitExit(() => clearInterval(interval))

  return {
    shouldProcess: () => {
      if (shouldProcess) {
        shouldProcess = false
        return true
      }

      return false
    },
  }
}

const createFileTransportDispatchServiceDispatch = (
  writeStream: fs.WriteStream,
  batchOptions: FileTransportBatchOptions | undefined,
): { dispatch: FileTransportDispatchService['dispatch'], close: () => Promise<void> } => {
  if (batchOptions?.age == null && batchOptions?.size == null) {
    return {
      dispatch: s => writeStream.write(s + '\n'),
      close: () => new Promise<void>(res => {
        writeStream.close(() => res())
      }),
    }
  }

  let logMessageQueue: string[]

  const processQueue = () => new Promise<void>(res => {
    writeStream.write(logMessageQueue.join('\n'), () => res())
    logMessageQueue = []
  })

  const processQueueWithAdditionalLastLogMessage = (s: string) => {
    writeStream.write(logMessageQueue.join('\n'))
    logMessageQueue = []
    writeStream.write(s)
  }

  const close = () => new Promise<void>(res => {
    processQueue().then(() => {
      writeStream.close(() => res())
    })
  })

  // If batch age is only defined, use a timer to decide when to process the queue
  if (batchOptions.age != null && batchOptions.size == null) {
    const timer = createLogMessageQueueTimer(batchOptions.age)
    return {
      dispatch: s => {
        if (timer.shouldProcess())
          processQueueWithAdditionalLastLogMessage(s)
        else
          logMessageQueue.push(s)
      },
      close,
    }
  }
  
  // If batch size is only defined, use the queue length to decide when to process the queue
  if (batchOptions.age == null && batchOptions.size != null) {
    const maxQueueSize = batchOptions.size
    return {
      dispatch: s => {
        if (logMessageQueue.length < maxQueueSize)
          logMessageQueue.push(s)
        else
          processQueueWithAdditionalLastLogMessage(s)
      },
      close,
    }
  }

  // Else (batch size and age are both defined), use the queue length and a timer
  // to decide when to process the queue
  const maxQueueSize = batchOptions.size as number
  const timer = createLogMessageQueueTimer(batchOptions.age as number)
  return {
    dispatch: s => {
      if (logMessageQueue.length < maxQueueSize && !timer.shouldProcess())
        logMessageQueue.push(s)
      else
        processQueueWithAdditionalLastLogMessage(s)
    },
    close,
  }
}

export const createFileTransportDispatchService = (
  outputFilePath: FileTransportOutFile,
  batchOptions?: FileTransportBatchOptions,
): FileTransportDispatchService => {
  const writeStream = typeof outputFilePath === 'string'
    ? fs.createWriteStream(outputFilePath, {flags : 'w'})
    : outputFilePath

  return createFileTransportDispatchServiceDispatch(writeStream, batchOptions)
}
