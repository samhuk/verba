import { SimpleOutlet } from '../../outlet/types'
import { SimpleOutletOverride } from '../base/types'

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
