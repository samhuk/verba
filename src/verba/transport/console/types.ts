import { NormalizedSimpleOutletOptions, SimpleOutlet } from '../../outlet/types'

/**
 * Overrides the logging behavior of simple outlets
 */
export type SimpleOutletOverride<
  TCode extends string | number = string | number,
  TData extends any = any
> = (options: NormalizedSimpleOutletOptions<TCode, TData>) => string | false

export type ConsoleTransportOptions<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  /**
   * Disables ANSI colors for all log messages.
   *
   * @default false
   */
  disableColors?: boolean
  /**
   * Overrides the logging behavior of simple outlets (`info`, `step`, `success`, `warn`).
   * 
   * @example
   * import verba, { consoleTransport, normalizeVerbaString } from 'verba'
   * 
   * const transport = consoleTransport({
   *   simpleOutletOverrides: {
   *     info: options => console.log('INFO', normalizeVerbaString(options.msg)),
   *     step: ...,
   *     ...
   *   }
   * })
   * 
   * const log = verba({ transports: [transport] })
   */
  simpleOutletOverrides?: Partial<{ [outlet in SimpleOutlet]: SimpleOutletOverride<TCode, TData> }>
}
