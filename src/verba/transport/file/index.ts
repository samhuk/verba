import * as fs from 'fs'

import { FileTransportOptions } from './types'
import { VerbaTransport } from '../types'
import { baseTransport } from '../base'
import { createDispatchService } from '../util/dispatchService'
import { createStreamMessageQueue } from '../util/dispatchService/streamMessageQueue'

const DEFAULT_OUTFILE = './log.txt'

const closeStream = (stream: fs.WriteStream) => new Promise<void>((res, rej) => {
  stream.close(err => {
    if (err == null)
      res()
    else
      rej(err)
  })
})

/**
 * A Verba Transport for outputting to a file.
 * 
 * Note: If using this Transport, be sure to call `await log.close()` before your program exits
 * to ensure that the stream finishes writing log messages to it.
 * 
 * @example
 * import verba, { fileTransport } from 'verba'
 * const log = verba({
 *   transports: [fileTransport({ outfile: 'log.txt' })]
 * })
 */
export const fileTransport = <
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
>(
  options?: FileTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => {
  const outfile = options?.outFile ?? DEFAULT_OUTFILE
  const stream = typeof outfile === 'string' ? fs.createWriteStream(outfile, { flags : 'w' }) : outfile
  const separator = options?.separator ?? '\n'
  const dispatchService = createDispatchService({
    dispatch: s => stream.write(s + separator),
    destroy: () => closeStream(stream),
    batchOptions: options?.batchOptions,
    createQueue: () => createStreamMessageQueue(stream, separator),
  })

  return baseTransport({
    isTty: false,
    onClose: dispatchService.destroy,
    dispatch: dispatchService.dispatch,
    disableColors: true,
    deltaT: options?.deltaT ?? false,
    outletPrefixes: options?.outletPrefixes,
    timePrefix: options?.timePrefix ?? false,
    codeRenderer: options?.codeRenderer ?? true,
    dataRenderer: options?.dataRenderer ?? true,
  })
}
