import { ConsoleTransportOptions } from './types'
import { VerbaTransport } from '../types'
import { baseTransport } from '../base'

/**
 * A Verba Transport for outputting to the Node.js `console.log`, supporting TTY and non-TTY terminals.
 *
 * This is the default Transport that Verba uses if none are explicitly defined.
 * 
 * @example
 * import verba, { consoleTransport } from 'verba'
 * // Explicit definition of console transport (this is default)
 * const log = verba({ transports: [consoleTransport()] })
 */
export const consoleTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(
  options?: ConsoleTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => baseTransport({
  isTty: process.stdout.isTTY,
  dispatch: s => process.stdout.write(s + '\n'),
  disableColors: options?.disableColors ?? false,
  simpleOutletOverrides: options?.simpleOutletOverrides,
  dispatchDeltaT: options?.dispatchDeltaT,
})
