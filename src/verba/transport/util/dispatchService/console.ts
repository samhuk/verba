import { DispatchServiceBatchOptions } from './base/types'
import { createDispatchService, createStreamMessageQueue } from './base'

export const createConsoleDispatchService = (options: {
  batchOptions: DispatchServiceBatchOptions | undefined,
}) => {
  const stream = process.stdout

  return createDispatchService({
    dispatch: s => stream.write(s + '\n'),
    batchOptions: options.batchOptions,
    createQueue: () => createStreamMessageQueue(stream),
  })
}
