import * as fs from 'fs'

import { FileTransportBatchOptions, FileTransportOutFile } from './types'

type FileTransportDispatchService = {
  dispatch: (s: string) => void
  close: () => void
}

const createLogMessageQueueTimer = (
  batchAge: number,
) => {
  let shouldProcess = false

  setInterval(() => {
    shouldProcess = true
  }, batchAge)

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
  batchOptions?: FileTransportBatchOptions,
): FileTransportDispatchService['dispatch'] => {
  if (batchOptions?.age == null && batchOptions?.size == null)
    return s => writeStream.write(s + '\n')

  let logMessageQueue: string[]

  const processQueueWithAdditionalLastLogMessage = (s: string) => {
    writeStream.write(logMessageQueue.join('\n'))
    writeStream.write(s)
    logMessageQueue = []
  }

  // If batch age is only defined, use a timer to decide when to process the queue
  if (batchOptions.age != null && batchOptions.size == null) {
    const timer = createLogMessageQueueTimer(batchOptions.age)
    return s => {
      if (timer.shouldProcess())
        processQueueWithAdditionalLastLogMessage(s)
      else
        logMessageQueue.push(s)
    }
  }
  
  // If batch size is only defined, use the queue length to decide when to process the queue
  if (batchOptions.age == null && batchOptions.size != null) {
    const maxQueueSize = batchOptions.size
    return s => {
      if (logMessageQueue.length < maxQueueSize)
        logMessageQueue.push(s)
      else
        processQueueWithAdditionalLastLogMessage(s)
    }
  }

  // Else (batch size and age are both defined), use the queue length and a timer
  // to decide when to process the queue
  const maxQueueSize = batchOptions.size as number
  const timer = createLogMessageQueueTimer(batchOptions.age as number)
  return s => {
    if (logMessageQueue.length < maxQueueSize && !timer.shouldProcess())
      logMessageQueue.push(s)
    else
      processQueueWithAdditionalLastLogMessage(s)
  }
}

export const createFileTransportDispatchService = (
  outputFilePath: FileTransportOutFile,
  batchOptions?: FileTransportBatchOptions,
): FileTransportDispatchService => {
  const writeStream = typeof outputFilePath === 'string'
    ? fs.createWriteStream(outputFilePath, {flags : 'w'})
    : outputFilePath

  return {
    dispatch: createFileTransportDispatchServiceDispatch(writeStream, batchOptions),
    close: () => writeStream.close(),
  }
}
