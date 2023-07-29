import { baseTransport } from '../base'
import { VerbaTransport } from '../types'
import { createFileTransportDispatchService } from './dispatchService'
import { FileTransportOptions } from './types'

/**
 * A Verba Transport for outputting to a file.
 * 
 * @example
 * import verba, { fileTransport } from 'verba'
 * const log = verba({
 *   transports: [fileTransport({ outfile: 'log.txt' })]
 * })
 */
export const fileTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(
  options?: FileTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => {
  const dispatchService = createFileTransportDispatchService(options?.outFile ?? './log.txt', options?.batchOptions)
  return baseTransport({
    isTty: false,
    dispatch: dispatchService.dispatch,
    disableColors: true,
    simpleOutletOverrides: options?.simpleOutletOverrides,
  })
}
