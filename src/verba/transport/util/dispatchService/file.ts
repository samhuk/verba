import * as fs from 'fs'
import { FileTransportOutFile } from '../../file/types'
import { DispatchServiceBatchOptions } from './base/types'
import { createDispatchService } from './base'
import { createStreamMessageQueue } from './base/streamMessageQueue'

const DEFAULT_OUTFILE = './log.txt'

const closeStream = (stream: fs.WriteStream) => new Promise<void>((res, rej) => {
  stream.close(err => {
    if (err == null)
      res()
    else
      rej(err)
  })
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
