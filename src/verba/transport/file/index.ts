import { FileTransportOptions } from './types'
import { VerbaTransport } from '../types'
import { baseTransport } from '../base'
import { createFileTransportDispatchService } from './dispatchService'

const DEFAULT_OUTFILE = './log.txt'

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
  const dispatchService = createFileTransportDispatchService(options?.outFile ?? DEFAULT_OUTFILE, options?.batchOptions)
  return baseTransport({
    isTty: false,
    dispatch: dispatchService.dispatch,
    disableColors: true,
    dispatchDeltaT: options?.dispatchDeltaT ?? false,
    simpleOutletOverrides: options?.simpleOutletOverrides,
    outletPrefixes: options?.outletPrefixes,
  })
}
