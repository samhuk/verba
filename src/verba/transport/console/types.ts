import { DispatchDeltaTOptions, SimpleOutletOverride } from '../base/types'
import { SimpleOutlet, SimpleOutletPrefixesOptions } from '../../outlet/types'

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
  /**
   * Configures the prefixes that appear for each outlet,
   * i.e. `info`, `step`, etc.
   *
   * @example
   * import verba from 'verba'
   * const log = verba({
   *   outletPrefixes: {
   *     info: 'info',
   *     step: f => f.cyan(f.underline('step')),
   *   }
   * })
   */
  outletPrefixes?: SimpleOutletPrefixesOptions
  /**
   * Configures the appearance of the delta-t indicator at the end of each log message.
   * 
   * This can take multiple types of values, allowing for a wide range of customization:
   * 
   * * `false` - Disables the indicator.
   * * `true` - Enables the indicator with default behavior.
   * * `StringFormat[]` - Enables the indicator with the given string formats (e.g. `red`, `bold`, `dim`, etc.)
   * * `(dt, formatter) => string` - Enables the indicator, allowing for the maximum degree of customization.
   * 
   * @default false
   * 
   * @example
   * false
   * true
   * ['yellow', 'italic']
   * (dt, f) => f.yellow(f.italic(`[${dt} ms]`))
   */
  dispatchDeltaT?: DispatchDeltaTOptions
}
