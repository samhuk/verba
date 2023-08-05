import { FileTransportOptions } from './types'

import { VerbaTransport } from '../types'
import { baseTransport } from '../base'
import { createFileDispatchService } from '../util/dispatchService/file'

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
  TCode extends string | number = string | number,
  TData extends any = any
>(
  options?: FileTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => {
  const dispatchService = createFileDispatchService(options)
  return baseTransport({
    isTty: false,
    onClose: dispatchService.destroy,
    dispatch: dispatchService.dispatch,
    disableColors: true,
    dispatchDeltaT: options?.dispatchDeltaT ?? false,
    outletPrefixes: options?.outletPrefixes,
    dispatchTimePrefix: options?.dispatchTimePrefix ?? false,
    codeRenderer: options?.codeRenderer ?? true,
  })
}
