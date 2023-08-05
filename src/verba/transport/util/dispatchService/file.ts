import * as fs from 'fs'
import { FileTransportOutFile } from '../../file/types'
import { DispatchServiceBatchOptions } from './base/types'
import { createDispatchService, createStreamMessageQueue } from './base'

const DEFAULT_OUTFILE = './log.txt'

const closeStream = (stream: fs.WriteStream) => new Promise<void>(res => {
  stream.close(() => res())
})



export const createFileDispatchService = (options: {
  outFile?: FileTransportOutFile,
  batchOptions?: DispatchServiceBatchOptions,
} | undefined) => {
  const outfile = options?.outFile ?? DEFAULT_OUTFILE
  const stream = typeof outfile === 'string'
    ? fs.createWriteStream(outfile, { flags : 'w' })
    : outfile

  return createDispatchService({
    dispatch: s => stream.write(s + '\n'),
    destroy: () => closeStream(stream),
    batchOptions: options?.batchOptions,
    createQueue: () => createStreamMessageQueue(stream),
  })
}
