import { baseTransport } from '../base'
import { VerbaTransport } from '../types'
import { ConsoleTransportOptions } from './types'

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
  dispatch: console.log,
  disableColors: options?.disableColors,
  simpleOutletOverrides: options?.simpleOutletOverrides,
})
