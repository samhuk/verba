import { CodeRenderer } from './code'
import { DataRenderer } from './data'
import { DispatchDeltaTOptions } from './dispatchDeltaT'
import { SimpleOutletPrefixesOptions } from '../../outlet/types'

export type BuiltInSimpleOutletPrefixNames = 'default' | 'textual' | 'textual-muted'

export type BaseTransportOptions<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = {
  dispatch: (s: string) => void
  onClose?: () => Promise<void> | void
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
   * 
   * @deprecated Use `deltaT` instead
   */
  dispatchDeltaT: DispatchDeltaTOptions
  /**
   * Configures the appearance of the delta-t indicator for each log message.
   * 
   * This can take multiple types of values, allowing for a wide range of customization:
   * 
   * * `false` - Disables the indicator.
   * * `true` - Enables the indicator with default behavior (default formatting and at the end).
   * * `StringFormat[]` - Enables the indicator with the given custom string formats (e.g. `['bold', 'grey']`).
   * * `(dt, formatter) => string` - Enables the indicator with custom formatting.
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
  deltaT: DispatchDeltaTOptions
  /**
   * Configures the prefixes that appear for each outlet, i.e. `info`, `step`, `success`, etc.
   * 
   * This can take multiple types of values:
   * * `default` - Default set of outlet prefixes, using short symbols.
   * * `textual` - Alternative set of outlet prefixes, using text, e.g. "INFO", "STEP", "WARN", etc.
   * * `textual-muted` - Alternative set of outlet prefixes, using lower-case text, e.g. "info", "step", "warn", etc.
   * * `{ info: 'INFO: ', step: '* ', ... }` - Completely custom outlet prefixes.
   */
  outletPrefixes: BuiltInSimpleOutletPrefixNames | SimpleOutletPrefixesOptions | undefined
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
   *   * `HH` - 2-digit hour of day (24h format), e.g. 00, 23
   *   * `hh` - 2-digit hour of day (12h format), e.g. 00, 11
   *   * `ii` - 2-digit minute of hour, e.g. 00, 59
   *   * `ss` - 2-digit second of minute, e.g. 00, 59
   *   * `MMM` - 3-letter-abbreviated month of year, e.g. "Jan", "Dec"
   *   * `a` - Meridiem, e.g. "AM", "PM"
   *
   * @default false
   * 
   * @example
   * false
   * true
   * 'yyyy-mm-dd|hh-ii-ss'
   * 'MMM dd|hh:ii:ss'
   * 
   * @deprecated Use `timePrefix` instead
   */
  dispatchTimePrefix: boolean | string
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
   *   * `HH` - 2-digit hour of day (24h format), e.g. 00, 23
   *   * `hh` - 2-digit hour of day (12h format), e.g. 00, 11
   *   * `ii` - 2-digit minute of hour, e.g. 00, 59
   *   * `ss` - 2-digit second of minute, e.g. 00, 59
   *   * `MMM` - 3-letter-abbreviated month of year, e.g. "Jan", "Dec"
   *   * `a` - Meridiem, e.g. "AM", "PM"
   *
   * @default false
   * 
   * @example
   * false
   * true
   * 'yyyy-mm-dd|hh-ii-ss'
   * 'MMM dd|hh:ii:ss'
   */
  timePrefix: boolean | string
  /**
   * Configures how log message codes are rendered.
   * 
   * This can take several types of values:
   * * `false` - Disables code rendering.
   * * `true` - Enables default code rendering.
   * * `(code, parentCode) => `VerbaString` - Enables custom code rendering.
   * 
   * @default true // Defaulting rendering
   * 
   * @example
   * false
   * true
   * code => `[${code}]`
   * (code, parentCode) => `${parentCode}/${code}`
   * (code, parentCode) => f => f.magenta(code ?? parentCode)
   */
  codeRenderer: boolean | CodeRenderer<TCode>
  /**
   * Configures how log message data are rendered.
   * 
   * This can take several types of values:
   * * `false` - Disables code rendering.
   * * `true` - Enables default code rendering.
   * * `(data) => `string` - Enables custom data rendering.
   * 
   * @default true // Defaulting rendering
   * 
   * @example
   * false
   * true
   * data => JSON.stringify(data, null, 2)
   */
  dataRenderer: boolean | DataRenderer<TData>
}
