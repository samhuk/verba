import { BaseOutletOptions, NestOptions, StepSpinner, VerbaLogger, VerbaLoggerOptions } from './types'
import { Spinner, SpinnerOptions } from './spinner/types'
import { createCodeStr, getParentCode } from './code'

import { NATIVE_OUTLETS } from './outlet'
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createIndentationString } from './util/indentation'
import { createSimpleOutletLoggers } from './simpleOutlet'
import { createSpinner } from './spinner'
import { normalizeVerbaString } from './string'
import { repeatStr } from './util/string'

const IS_TTY = process.stdout.isTTY === true

const logStepWithSpinner = (
  options: (BaseOutletOptions & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  parentCode: string | number | undefined,
  indentation: number,
  indentationString: string,
  onSpinnerDestroy: () => void,
): Spinner => {
  const code = options.code ?? parentCode
  const codeStr = createCodeStr(code)
  const msg = Array.isArray(options.msg)
    ? options.msg.map(s => normalizeVerbaString(s)).join(`\n${indentationString}`)
    : normalizeVerbaString(options.msg)

  const spinner = createSpinner(
    typeof options.spinner === 'boolean'
      ? {
        text: codeStr + msg,
        color: 'cyan',
        indentation,
      }
      : {
        ...options.spinner,
        indentation: options.spinner?.indentation ?? indentation,
      },
  )

  return {
    text: s => spinner.text(code != null ? codeStr + normalizeVerbaString(s) : s),
    color: spinner.color,
    start: spinner.start,
    clear: spinner.clear,
    pause: spinner.pause,
    destroy: () => {
      spinner.destroy()
      onSpinnerDestroy()
    },
    stopAndPersist: () => {
      spinner.stopAndPersist()
      onSpinnerDestroy()
    },
  }
}

/**
 * The spinners, no matter the "nestedness" of VerbaLogger, all share one terminal,
 * so we track the current spinner that is occupying the terminal here. This could
 * be done better, abstracting the specific "spinner" concept to a "generic terminal
 * output occupier" interface. For now, spinner is fine.
 */
let currentSpinner: Spinner | undefined

const _createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
>(options: TOptions, nestOptionsList: NestOptions<TCode>[]): VerbaLogger<TOptions, TCode, TData> => {
  const indentation = nestOptionsList.reduce((acc, no) => acc + (no.indent ?? 0), 0)
  const indentationString = createIndentationString(indentation)
  const parentCode = getParentCode(nestOptionsList)
  const simpleOutletLoggers = createSimpleOutletLoggers(options, parentCode)

  return {
    log: msg => NATIVE_OUTLETS.log(normalizeVerbaString(msg)),
    info: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.info(_options, indentationString)
    },
    step: _options => {
      if (typeof _options === 'object' && _options.spinner) {
        if (IS_TTY) {
          currentSpinner?.destroy()
          currentSpinner = logStepWithSpinner(_options as any, parentCode, indentation, indentationString, () => {
            currentSpinner = undefined
          })
          return currentSpinner
        }

        // When stdout is not TTY, then spinner functionality is not possible.
        // Therefore we log the initial message, and depending 
        simpleOutletLoggers.step(_options, indentationString)
        return {
          start: () => simpleOutletLoggers.step(_options, indentationString),
          color: () => undefined,
          clear: () => undefined,
          destroy: () => undefined,
          pause: () => undefined,
          stopAndPersist: () => undefined,
          text: (s, onlyTty) => onlyTty
            ? undefined
            : simpleOutletLoggers.step({ ..._options, msg: s }, indentationString),
        } as StepSpinner
      }

      simpleOutletLoggers.step(_options, indentationString)
      return undefined as any
    },
    success: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.success(_options, indentationString)
    },
    warn: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.warn(_options, indentationString)
    },
    // error: _options => undefined,
    table: (data, _options) => {
      currentSpinner?.clear()
      NATIVE_OUTLETS.log(columify(data, _options))
    },
    nest: _options => _createVerbaLogger(options, nestOptionsList.concat(_options)),
    json: (value, _options) => {
      currentSpinner?.clear()
      NATIVE_OUTLETS.log(colorizeJson(value, {
        pretty: _options?.pretty ?? false,
      }))
    },
    divider: () => {
      currentSpinner?.clear()
      NATIVE_OUTLETS.log(repeatStr('-', process.stdout.columns * 0.33))
    },
    spacer: numLines => {
      currentSpinner?.clear()
      NATIVE_OUTLETS.log(repeatStr('\n', (numLines ?? 1 - 1)))
    },
  }
}

/**
 * Creates a `VerbaLogger` instance.
 * 
 * @example
 * import verba from 'verba'
 * 
 * const log = verba()
 * 
 * // -- Simple outlets
 * log.step('Starting task')
 * log.info(f => `Estimated task length: ${f.cyan('5m4s')}`)
 * log.success('Task completed')
 * log.warn({
 *   msg: f => `Env var ${f.bold('DB_URL')} is missing; using default.`,
 *   code: 'ENV_VALIDATE',
 * })
 * // -- Nesting
 * const childLog = log.nest({ code: 'CHILD_TASK' })
 * childLog.step('Starting child task')
 * // -- Other outlet
 * log.divider()
 * log.spacer()
 * log.table([{...},{...],...])
 * log.json({ foo: 'bar' })
 */
export const createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
// eslint-disable-next-line arrow-body-style
>(options?: TOptions): VerbaLogger<TOptions, TCode, TData> => _createVerbaLogger(
    options ?? { },
    [],
  )
