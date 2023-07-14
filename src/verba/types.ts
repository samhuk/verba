import { Spinner, SpinnerOptions } from './spinner/types'

import { GlobalOptions as ColumifyOptions } from 'columnify'
import { VerbaString } from './string/types'

export type MutableRef<T extends any = any> = {
  current: T
}

export type VerbaLoggerOptions = {
  /**
   * Configures the prefixes that appear for each outlet,
   * i.e. `info`, `step`, etc.
   *
   * @example
   * const log = createVerbaLogger({
   *   outletPrefixes: {
   *     info: 'info',
   *     step: f => f.cyan(f.underline('step')),
   *   }
   * })
   */
  outletPrefixes?: SimpleOutletPrefixesOptions
}

export type SimpleOutlet = 'info' | 'step' | 'success' | 'warn' | 'error'

export type SimpleOutletPrefixesOptions = Partial<Record<SimpleOutlet, VerbaString>>

export type SimpleOutletPrefixes = Record<SimpleOutlet, string>

export type BaseOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * The log message.
   */
  msg: VerbaString | VerbaString[]
  /**
   * Optional miscellaneous data associated with the log message.
   */
  data?: TData
  /**
   * An optional code to describe the area of the app that the code is in.
   */
  code?: TCode
}

type InfoOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

export type StepOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
  TSpinner extends boolean | Omit<SpinnerOptions, 'text'> = boolean | Omit<SpinnerOptions, 'text'>
> = VerbaString | (BaseOutletOptions<TCode, TData> & {
  /**
   * If set, the step will show a spinner on the left-hand-side and return
   * a `Spinner` object that can be used to interact with it.
   *
   * May take the value of:
   * * `false` - disable spinner
   * * `true` - show default spinner
   * * `object` (SpinnerOptions) - show spinner and configure its appearance
   * 
   * @example
   * import verba from 'verba'
   *
   * const log = verba()
   * 
   * const main = async () => {
   *   const spinner = log.step({
   *     msg: 'Starting task',
   *     spinner: true
   *   })
   *   await doTask()
   *   spinner.stop()
   *   log.success('Completed task!')
   * }
   *
   * main()
   */
  spinner?: TSpinner
})

export type StepSpinner = Omit<Spinner, 'text'> & {
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

export type StepResult<TStepOptions extends StepOptions = StepOptions> = TStepOptions extends { spinner: any }
  ? TStepOptions['spinner'] extends true | Omit<SpinnerOptions, 'text'>
    ? StepSpinner
    : void
  : void

type SuccessOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

type WarnOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

type ErrorOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

export type AnyOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = InfoOptions<TCode, TData>
  | StepOptions<TCode, TData>
  | SuccessOptions<TCode, TData>
  | WarnOptions<TCode, TData>
  | ErrorOptions<TCode, TData>

export type NestOptions<
  TCode extends string | number = string | number,
> = { indent?: number, code?: TCode }

export type JsonOptions = {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   * 
   * @default false
   */
  pretty?: boolean
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
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Logs a message with no prefix or otherwise additional formatting.
   *
   * Alias for `console.log`.
   *
   * @param msg The log message
   *
   * @example
   * log.log('Hello, world!')
   * log.log(f => f.cyan('Hello, world!'))
   */
  log: (msg: VerbaString) => void
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
  info: (options: InfoOptions<TCode>) => void
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
  step: <TStepOptions extends StepOptions<TCode>>(options: TStepOptions) => StepResult<TStepOptions>
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
  success: (options: SuccessOptions<TCode>) => void
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
  warn: (options: WarnOptions<TCode>) => void
  // TODO: Implement errors, using good-flow?
  // error: (options: GFError<{ code: TCode, [prop: string]: any }>) => void
  /**
   * Prints the given data as a table using [columnify](https://github.com/timoxley/columnify).
   *
   * @param data Data to print
   * @param options Options to configure the table (from columnify).
   */
  table: (data: any, options?: ColumifyOptions) => void
  /**
   * Creates a nested logger with the provided options as defaults for subsequent
   * logging calls of the nested logger.
   *
   * This is useful for providing a default `code` for logs to avoid duplication.
   *
   * @returns `VerbaLogger`
   *
   * @example
   * const log = createVerbaLogger()
   * const childLog = log.nest({ code: 'CHILD_TASK' })
   * childLog.log('This is a child task') // Will have the `code` "CHILD_TASK"
   */
  nest: (options: NestOptions<TCode>) => VerbaLogger<TOptions, TCode, TData>
  /**
   * Logs any value with JSON syntax highlighting.
   *
   * @param value The value to log
   * @param options Optional options to configure the appearance.
   */
  json: (value: any, options?: JsonOptions) => void
  /**
   * Logs empty lines to provide vertical spacing.
   *
   * @param numLines Number of empty lines. Default: `1`
   *
   * @example
   * log.spacer() // 1 empty line
   * log.spacer(5) // 5 empty lines
   */
  spacer: (numLines?: number) => void
  /**
   * Logs a horizontal line divider.
   *
   * @example
   * log.divider()
   */
  divider: () => void
}
