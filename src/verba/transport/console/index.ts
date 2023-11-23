import { ConsoleTransportOptions } from './types'
import { VerbaTransport } from '../types'
import { baseTransport } from '../base'
import { createConsoleDispatchService } from '../util/dispatchService/console'

const isAnyBatchingBehaviorSpecified = (options: ConsoleTransportOptions<any> | undefined) => (
  options?.batchOptions?.interval != null || options?.batchOptions?.size != null
)

/**
 * A Verba Transport for outputting to `process.stdout`, supporting TTY and non-TTY terminals.
 *
 * This is the default Transport that Verba uses if none are explicitly defined.
 * 
 * @example
 * import verba, { consoleTransport } from 'verba'
 * // Explicit definition of console transport (this is default)
 * const log = verba({ transports: [consoleTransport()] })
 */
export const consoleTransport = <
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
>(
  options?: ConsoleTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> =>{
  const dispatchService = createConsoleDispatchService({
    batchOptions: options?.batchOptions,
  })
  return baseTransport({
    isTty: process.stdout.isTTY && !isAnyBatchingBehaviorSpecified(options),
    dispatch: dispatchService.dispatch,
    onClose: dispatchService.destroy,
    disableColors: options?.disableColors ?? false,
    deltaT: options?.deltaT ?? false,
    outletPrefixes: options?.outletPrefixes,
    timePrefix: options?.timePrefix ?? false,
    codeRenderer: options?.codeRenderer ?? true,
    dataRenderer: options?.dataRenderer ?? true,
    prefix: options?.prefix ?? undefined,
  })
}
