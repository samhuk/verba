import { StepOptions, StepResult } from './step/types'

import { GlobalOptions as ColumifyOptions } from 'columnify'
import { OutletFilter } from './outletFilter/types'
import { VerbaString } from './verbaString/types'
import { VerbaTransport } from './transport/types'

export type VerbaLoggerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
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
   * Log message filters. These apply to all defined transports.
   * 
   * @example
   * import verba, { OutletFilter } from 'verba'
   * // Filter out table log messages
   * const myFilter: OutletFilter = options => options.outlet !== Outlet.TABLE
   * const log = verba({ outletFilters: [myFilter] })
   */
  outletFilters?: OutletFilter<TCode, TData>[]
  /**
   * Verba Transports, defining how log messages are outputted. By default,
   * this is a console transport that outputs log messages to the Node.js `console`.
   * 
   * @example
   * import verba, { VerbaTransport } from 'verba'
   * 
   * const transport: VerbaTransport = (loggerOptions, listeners) => {
   *   ...
   *   return nestState => {
   *     ...
   *     return {
   *       log: msg => ...,
   *       info: options => ...,
   *       step: options => ...,
   *       success: options => ...,
   *       warn: options => ...,
   *       table: (data, options) => ...,
   *       json: (data, options) => ...,
   *       divider: () => ...,
   *       spacer: numLines => ...,
   *     }
   *   }
   * }
   * 
   * const log = verba({ plugins: [transport] })
   */
  transports?: VerbaTransport<TCode, TData>[]
}

export enum Outlet {
  LOG = 'log',
  INFO = 'info',
  STEP = 'step',
  SUCCESS = 'success',
  WARN = 'warn',
  TABLE = "table",
  JSON = "json",
  DIVIDER = "divider",
  SPACER = "spacer",
}

export type NestOptions<
  TCode extends string | number = string | number,
> = {
  /**
   * Add on a default indentation for all subsequent calls to the child logger.
   */
  indent?: number
  /**
   * Define a default code for all subsequent calls to the child logger.
   */
  code?: TCode
}

export type NestState<TCode extends string | number = string | number> = {
  /**
   * The current indentation index of the logger.
   */
  indent: number
  /**
   * The current indentation string of the logger.
   */
  indentationString: string
  /**
   * The current log code of the logger. This will be used as the default
   * log code for subsequent calls to the logger, however can be overridden
   * by specifying the `code` for particular log messages as a different code
   * or explicitly `null` to remove the code.
   */
  code: TCode | undefined
}

export type SimpleOutlet = 'info' | 'step' | 'success' | 'warn'

export type SimpleOutletPrefixesOptions = Partial<Record<SimpleOutlet, VerbaString>>

export type SimpleOutletPrefixes = Record<SimpleOutlet, string>

export type SimpleOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | {
  /**
   * The log message.
   * 
   * @example
   * '5 users found'
   * f => `${f.yellow('5')} users found`
   */
  msg: VerbaString
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
  /**
   * Optional code to describe the area of the app that the log message is about.
   * 
   * @example
   * 'INIT'
   * 'CONNECT_DB'
   * 'USER_AUTHENTICATE'
   * ...
   */
  code?: TCode
}

export type NormalizedSimpleOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * The log message.
   */
  msg: VerbaString
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
}

export type JsonOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   * 
   * @default false
   */
  pretty?: boolean
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
  /**
   * Optional log code for the log message.
   */
  code?: TCode
}

export type NormalizedJsonOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   */
  pretty: boolean
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
}

export type TableOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ColumifyOptions & {
  /**
   * Optional log code for the log message.
   */
  code?: TCode
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
}

export type NormalizedTableOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ColumifyOptions & {
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
}
/**
 * Options for `spacer` log calls. This can take either an integer value
 * to denote the number of lines, or an object to provide more information.
 * 
 * @default 1
 */
export type SpacerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = number | {
  /**
   * The number of lines.
   * 
   * @default 1
   */
  numLines?: number
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
  /**
   * Optional log code for the log message.
   */
  code?: TCode
}

export type NormalizedSpacerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * The number of lines.
   */
  numLines: number
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
}

export type DividerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Optional log code for the log message.
   */
  code?: TCode
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
}

export type NormalizedDividerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
}

/**
 * Creates a Verba logger.
 *
 * @example
 * import verba from 'verba'
 * const log = verba()
 * log.info('Hello, world!')
 */
export type VerbaLogger<
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions<TCode, TData> = VerbaLoggerOptions<TCode, TData>,
> = {
  /**
   * Creates a nested logger with the provided options as defaults for subsequent
   * logging calls of the nested logger.
   *
   * This is useful for providing a default `code` for logs to avoid duplication.
   *
   * @returns `VerbaLogger`
   *
   * @example
   * import verba from 'verba'
   * const log = verba()
   * const childLog = log.nest({ code: 'CHILD_TASK' })
   * childLog.log('This is a child task') // Will have the `code` "CHILD_TASK"
   */
  nest: (options: NestOptions<TCode>) => VerbaLogger<TCode, TData, TOptions>
  /**
   * Logs a message with no prefix, i.e. can be used as an alias of `console.log`
   *
   * @example
   * log.log('Hello, world!')
   * log.log(f => f.cyan('Hello, world!'))
   * log.log({
   *   msg: 'Hello, world!',
   *   code: 'HELLO_WORLD_MSG'
   * })
   */
  log: (msg: SimpleOutletOptions<TCode, TData>) => void
  /**
   * Logs an informational message.
   *
   * @example
   * log.info('5 users found')
   * log.info(f => `${f.yellow('5') users found}`)
   * log.info({
   *   msg: '5 users found',
   *   code: 'USER_METRICS'
   * })
   */
  info: (options: SimpleOutletOptions<TCode>) => void
  /**
   * Logs a step/action message.
   * 
   * @returns
   * Dependant on the provided value of the `spinner` option:
   * * Not provided / `false`: `void`
   * * `true` / `object`: A `Spinner` object
   *
   * @example
   * // -- Without spinner --
   * log.step('Finding up to 5 users.')
   * log.step(f => `Finding up to ${f.yellow('5')} users.`)
   * log.step({
   *   msg: 'Finding up to 5 users.',
   *   code: 'USER_METRICS'
   * })
   *
   * // -- With spinner --
   * const spinner = log.step({
   *   msg: 'Finding up to 5 users.',
   *   code: 'USER_METRICS',
   *   spinner: true,
   * })
   * const users = await findUsers()
   * spinner.stop()
   */
  step: <TStepOptions extends StepOptions<TCode, TData>>(options: TStepOptions) => StepResult<TStepOptions>
  /**
   * Logs a success message.
   *
   * @example
   * log.success('Processed 5 users.')
   * log.success(f => `Processed ${f.yellow('5')} users.`)
   * log.success({
   *   msg: 'Processed 5 users.',
   *   code: 'USER_METRICS'
   * })
   */
  success: (options: SimpleOutletOptions<TCode>) => void
  /**
   * Logs a warning message.
   *
   * @example
   * log.warn('Could not find 5 users.')
   * log.warn(f => `Could not find ${f.yellow('5')} users.`)
   * log.warn({
   *   msg: 'Could not find 5 users.',
   *   code: 'USER_METRICS'
   * })
   */
  warn: (options: SimpleOutletOptions<TCode>) => void
  /**
   * Prints the given data as a table using [columnify](https://github.com/timoxley/columnify).
   *
   * @param data Data to print
   * @param options Optional additional configuration
   * 
   * @example
   * const data = [
   *   { col1: 'a', col2: 'b' },
   *   { col1: 'c', col2: 'd' }
   * ]
   * log.table(data)
   * log.table(data, {
   *   code: 'TABLE_DATA_MSG' // Optional log code
   * })
   */
  table: (data: any, options?: TableOptions<TCode>) => void
  /**
   * Logs any value with JSON syntax highlighting.
   *
   * @param value The value to log
   * @param options Optional additional configuration
   * 
   * @example
   * log.json({ foo: 'bar', fizz: 'buzz' })
   * log.json(
   *   { foo: 'bar', fizz: 'buzz' },
   *   {
   *     pretty: true, // Pretty-print (indentation)
   *     code: 'JSON_DATA_MSG', // Optional log code
   *   }
   * )
   */
  json: (value: any, options?: JsonOptions<TCode>) => void
  /**
   * Logs empty lines to provide vertical spacing.
   *
   * @example
   * log.spacer() // 1 empty line
   * log.spacer(5) // 5 empty lines
   * log.spacer({
   *   numLines: 5,
   *   code: 'SPACER' // Optional log code
   * })
   */
  spacer: (options?: SpacerOptions<TCode>) => void
  /**
   * Logs a horizontal line divider.
   *
   * @example
   * log.divider()
   * log.divider({
   *   code: 'DIVIDER' // Optional log code
   * })
   */
  divider: (options?: DividerOptions<TCode>) => void
}
