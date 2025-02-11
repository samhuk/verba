import { DateTimeFormat, DateTimeFormatOptions } from '../../util/date'

import { CodeRenderer } from './code'
import { DataRenderer } from './data'
import { DispatchDeltaTOptions } from './dispatchDeltaT'
import { SimpleOutletPrefixesOptions } from '../../outlet/types'
import { StringFormat } from '../../verbaString/types'

export type BuiltInSimpleOutletPrefixNames = 'default' | 'textual' | 'textual-muted'

export type DispatchTimePrefixOptions = Partial<DateTimeFormatOptions> & {
  /**
   * Optional list of string formats to apply to the date-time string.
   * 
   * @default
   * ['grey']
   * 
   * @example
   * ['blue', 'italic']
   */
  stringFormats?: StringFormat[]
}

export type BaseTransportOptions<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = {
  /**
   * The function that logs the formatted message.
   * 
   * @example
   * s => process.stdout.write(s + '\n')
   */
  dispatch: (logMessage: string) => void
  /** Called when Verba is closed. Useful to run any clean-up tasks. */
  onClose?: () => Promise<void> | void
  /**
   * Indicates whether this transport supports TTY, which will enable "animation"-like behaviors such as spinners, progress, bars, etc.
   */
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
   * Configures the appearance of the dispatch time that appears at the start of each log message.
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
   *   * `tz` - Timezone offset, e.g. "+01:00", "-07:00"
   * * `object` - Enables the indicator with full customization, allowing specification of date-time and string formats
   *
   * @default false
   * 
   * @example
   * false
   * true
   * 'yyyy-mm-dd|hh-ii-ss'
   * 'MMM dd|hh:ii:ss'
   * {
   *   dateTimeFormat: 'yyyy-mm-dd|hh-ii-ss',
   *   stringFormats: ['grey', 'italic']
   * }
   */
  timePrefix: boolean | DateTimeFormat | DispatchTimePrefixOptions
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
  /**
   * Optional prefix to print before every line.
   * 
   * This may take two types of values:
   * * `string` - shows prefix with no additional formatting
   * * `{ text: string, formats?: StringFormat[] }` - shows prefix `text` with the given `formats`.
   * 
   * @example 'server'
   * 
   * @example { text: 'server', formats: ['blue', 'italic'] }
   */
  prefix?: string | { text: string, formats?: StringFormat[] }
}
