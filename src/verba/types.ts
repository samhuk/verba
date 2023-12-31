import { Alias, Aliases } from './alias/types'
import { DividerOptions, JsonOptions, ProgressBarOptions, SimpleOutletOptions, SpacerOptions, SpinnerOptions, TableOptions } from './outlet/types'

import { Cast } from './util/types'
import { OutletFilter } from './outletFilter/types'
import { ProgressBar } from './progressBar/types'
import { Spinner } from './spinner/types'
import { VerbaString } from '../types'
import { VerbaTransport } from './transport/types'

export type OutletSpinner = Omit<Spinner, 'text'> & {
  /**
   * Updates the text of the spinner.
   * 
   * @param onlyTty Determines whether this will only appear for TTY terminals,
   * (therefore hidden for non-TTY terminals).
   * 
   * Non-TTY terminals do not support terminal animations such as spinners,
   * therefore calls to `text` cause new lines to appear which may result in
   * in a lot of undesirable terminal output. In this case, `onlyTty` can be
   * set to `true` for some or all of the `text` calls, to avoid this.
   */
  text: (newText: VerbaString, onlyTty?: boolean) => void
}

export type VerbaOptions<
  TCode extends string | number | undefined  = string | number | undefined ,
  TData extends any = any,
> = {
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

export type NestOptions<
  TCode extends string | number | undefined = string | number | undefined,
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

export type NestState<TCode extends string | number | undefined = string | number | undefined> = {
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

export type VerbaBaseOutlets<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any,
> = {
  /**
   * Logs a message with no prefix, i.e. can be used as an alias of `console.log`
   *
   * @example
   * log.log('Hello, world!')
   * log.log(f => f.cyan('Hello, world!'))
   * log.log({
   *   msg: 'Hello, world!',
   *   code: 'HELLO_WORLD_MSG', // Optional log code
   *   data: { ... }, // Optional data
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
   *   code: 'USER_METRICS', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  info: (options: SimpleOutletOptions<TCode, TData>) => void
  /**
   * Logs a step/action message.
   *
   * @example
   * log.step('Finding up to 5 users.')
   * log.step(f => `Finding up to ${f.yellow('5')} users.`)
   * log.step({
   *   msg: 'Finding up to 5 users.',
   *   code: 'USER_METRICS', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  step: (options: SimpleOutletOptions<TCode, TData>) => void
  /**
   * Logs a success message.
   *
   * @example
   * log.success('Processed 5 users.')
   * log.success(f => `Processed ${f.yellow('5')} users.`)
   * log.success({
   *   msg: 'Processed 5 users.',
   *   code: 'USER_METRICS', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  success: (options: SimpleOutletOptions<TCode, TData>) => void
  /**
   * Logs a warning message.
   *
   * @example
   * log.warn('Could not find 5 users.')
   * log.warn(f => `Could not find ${f.yellow('5')} users.`)
   * log.warn({
   *   msg: 'Could not find 5 users.',
   *   code: 'USER_METRICS', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  warn: (options: SimpleOutletOptions<TCode, TData>) => void
  /**
   * Logs an error message.
   * 
   * @example
   * log.error('Could not find 5 users.')
   * log.error(f => `Could not find ${f.yellow('5')} users.`)
   * log.error({
   *   msg: 'Could not find 5 users.',
   *   code: 'USER_METRICS', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  error: (options: SimpleOutletOptions<TCode, TData>) => void
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
   *   code: 'TABLE_DATA_MSG', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  table: (data: any, options?: TableOptions<TCode, TData>) => void
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
   *     data: { ... }, // Optional data
   *   }
   * )
   */
  json: (value: any, options?: JsonOptions<TCode, TData>) => void
  /**
   * Logs empty lines to provide vertical spacing.
   *
   * @example
   * log.spacer() // 1 empty line
   * log.spacer(5) // 5 empty lines
   * log.spacer({
   *   numLines: 5,
   *   code: 'SPACER', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  spacer: (options?: SpacerOptions<TCode, TData>) => void
  /**
   * Logs a horizontal line divider.
   *
   * @example
   * log.divider()
   * log.divider({
   *   code: 'DIVIDER', // Optional log code
   *   data: { ... }, // Optional data
   * })
   */
  divider: (options?: DividerOptions<TCode, TData>) => void
  /**
   * Logs an updatable spinner.
   * 
   * **Note:** This will only work in TTY transports.
   * 
   * @example
   * const spinner = log.spinner({
   *   msg: 'Finding up to 5 users.',
   *   code: 'USER_METRICS', // Optional log code
   *   data: { ... }, // Optional data
   *   spinner: true,
   * })
   * const users = await findUsers()
   * spinner.stop()
   */
  spinner: (options?: SpinnerOptions<TCode, TData>) => OutletSpinner
  /**
   * Logs an updatable progress bar.
   * 
   * **Note:** This will only work in TTY transports.
   * 
   * @example
   * const progressBar = log.progressBar()
   * progressBar.update(20) // 20%
   * // Once done, either remove from console...
   * progressBar.destroy()
   * // ...Or print the latest progress bar state and move onto new console line
   * progressbar.destroyAndPersist()
   */
  progressBar: (options?: ProgressBarOptions<TCode, TData>) => ProgressBar
}

/**
 * Creates a Verba logger.
 *
 * @example
 * import verba from 'verba'
 * const log = verba()
 * log.info('Hello, world!')
 */
export type Verba<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any,
  TAliases extends Aliases<TCode, TData> = {},
> = {
  /**
   * Creates a nested logger with the provided options as defaults for subsequent
   * logging calls of the nested logger.
   *
   * This is useful for providing a default `code` for logs to avoid duplication.
   *
   * @returns `Verba`
   *
   * @example
   * import verba from 'verba'
   * const log = verba()
   * const childLog = log.nest({ code: 'CHILD_TASK' })
   * childLog.log('This is a child task') // Will have the `code` "CHILD_TASK"
   * 
   * @deprecated Use `child` instead.
   */
  nest: (options: NestOptions<TCode>) => Verba<TCode, TData>
  /**
   * Creates a nested logger with the provided options as defaults for subsequent
   * logging calls of the nested logger.
   *
   * This is useful for providing a default `code` for logs to avoid duplication.
   *
   * @returns `Verba`
   *
   * @example
   * import verba from 'verba'
   * const log = verba()
   * const childLog = log.child({ code: 'CHILD_TASK' })
   * childLog.log('This is a child task') // Will have the `code` "CHILD_TASK"
   */
  child: (options: NestOptions<TCode>) => Verba<TCode, TData>
  /**
   * Signals to all Transports added to the instance that this function has been
   * called, resolving only when all of the Transports that have registered a close
   * handler to have asynchronously completed.
   * 
   * Use this when using the `fileTransport` or any other added Transport that needs
   * to perform tear-down operations (asynchronous or not).
   */
  close: () => Promise<void[]>
  /**
   * Sets the aliases for the logger instance.
   * 
   * Aliases are useful for adding new custom outlets on the logger instance
   * in order to, for example:
   * * Replace the existing base outlets (such as `log`, `info`, etc.)
   * * Add on new custom outlets
   * 
   * Aliases can be used to exclude Verba's built-in outlets too via setting
   * them to `false`
   * 
   * @example
   * import verba from 'verba'
   * 
   * const log = verba().setAliases({
   *   // Modify arguments of built-in `info` outlet
   *   info: logger => (s: string) => logger.info(s),
   *   // Add new custom `header` outlet
   *   header: logger => (s: string) => {
   *     logger.log(f => f.bold(f.italic(`-- ${s} --`)))
   *     logger.spacer()
   *   },
   *   // Exclude built-in `json` outlet
   *   json: false
   * })
   *
   * log.header('foo')
   */
  setAliases: <TNewAliases extends Aliases<TCode, TData>>(aliases: TNewAliases) => Verba<TCode, TData, TNewAliases>
}
  & (
    keyof TAliases extends never
      ? VerbaBaseOutlets<TCode, TData>
      : (
        // Add on the base outlets, excluding those that the aliases define.
        Omit<VerbaBaseOutlets<TCode, TData>, keyof TAliases>
          // Add on the aliases (ones that aren't false)
          & {
            [TAliasName in keyof TAliases as TAliases[TAliasName] extends false
              ? never
              : TAliasName]: ReturnType<Cast<TAliases[TAliasName], Exclude<Alias, false>>>
          }
      )
  )
