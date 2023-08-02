import { Colors, StringFormat } from '../../verbaString/types'
import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixesOptions } from '../../outlet/types'

export type InterruptedTtyConsolerOccupier = {
  resume: () => void
}

/**
 * A type that represents an entity that is occupying the current (TTY) console output.
 * 
 * This could be a progress bar, a spinner, etc.
 */
export type TtyConsoleOccupier = {
  interrupt: () => void
  resume: () => void
  destroy: () => void
}

type DispatchDeltaTFormat = true | StringFormat[] | ((dt: number, f: Colors) => string)

export type DispatchDeltaTOptions = false
  | DispatchDeltaTFormat
  | {
    /**
     * The format, i.e. `StringFormat[]` or `(dt: number, f: Colors) => string`
     */
    format?: Exclude<DispatchDeltaTFormat, true>
    /**
     * The position of the indicator.
     */
    position?: 'start' | 'end'
  }

/**
 * Overrides the logging behavior of simple outlets
 */
export type SimpleOutletOverride<
  TCode extends string | number = string | number,
  TData extends any = any
> = (options: NormalizedSimpleOutletOptions<TCode, TData>) => string | false

export type BaseTransportOptions<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  dispatch: (s: string) => void
  isTty: boolean
  /**
   * Disables ANSI colors for all log messages if `true`.
   *
   * @default false
   */
  disableColors: boolean
  /**
   * Configures the appearance of the delta-t indicator for each log message.
   * 
   * This can take multiple types of values, allowing for a wide range of customization:
   * 
   * * `false` - Disables the indicator.
   * * `true` - Enables the indicator with default behavior (default formatting and at the end).
   * * `StringFormat[]` - Same as `true` but allows for custom string formats (e.g. `red`, `bold`, `dim`, etc.).
   * * `(dt, formatter) => string` - Enables the indicator with totally custom formatting, at the end.
   * * `{ format: ..., position: 'start' | 'end'}` - Enables the indicator, allowing for maximum customization.
   * 
   * @default false
   * 
   * @example
   * false
   * true
   * ['yellow', 'italic']
   * (dt, f) => f.yellow(f.italic(`[${dt} ms]`))
   * {
   *   format: (dt, f) => f.yellow(f.italic(`[${dt} ms]`)),
   *   position: 'end'
   * }
   */
  dispatchDeltaT: DispatchDeltaTOptions
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
  simpleOutletOverrides: Partial<{ [outlet in SimpleOutlet]: SimpleOutletOverride<TCode, TData> }> | undefined
  /**
   * Configures the prefixes that appear for each outlet, i.e. `info`, `step`, `success`, etc.
   */
  outletPrefixes: SimpleOutletPrefixesOptions | undefined
  /**
   * Configures the time that appears at the start of each log messages.
   * 
   * This can take several types of values:
   * * `false` - Disables the indicator.
   * * `true` - Enables the indicator with default formatting, e.g. 04:07:42 PM.
   * * `string` - Enables the indicator with a specific date format. The available tokens are:
   *   * `yyyy` - 4-digit year, e.g. 1970, 2023
   *   * `mm` - 2-digit month of year, e.g. 01, 12
   *   * `dd` - 2-digit day of month, e.g. 01, 31
   *   * `hh` - 2-digit hour of day, e.g. 00, 24
   *   * `ii` - 2-digit minute of hour, e.g. 00, 59
   *   * `ss` - 2-digit second of minute, e.g. 00, 59
   * @default false
   * 
   * @example
   * false
   * true
   * 'yyyy-mm-dd|hh-ii-ss'
   */
  dispatchTimePrefix: boolean | string
}
