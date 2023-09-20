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
    dispatchDeltaT: false, // TODO: Remove once fully deprecated
    deltaT: options?.deltaT ?? options?.dispatchDeltaT ?? false,
    outletPrefixes: options?.outletPrefixes,
    dispatchTimePrefix: false, // TODO: Remove once fully deprecated
    timePrefix: options?.timePrefix ?? options?.dispatchTimePrefix ?? false,
    codeRenderer: options?.codeRenderer ?? true,
    dataRenderer: options?.dataRenderer ?? true,
  })
}
