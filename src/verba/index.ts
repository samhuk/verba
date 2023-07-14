import { NestOptions, VerbaLogger, VerbaLoggerOptions } from './types'

import { NATIVE_OUTLETS } from './nativeOutlets'
import { Spinner } from './spinner/types'
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createIndentationString } from './util/indentation'
import { createSimpleOutletLoggers } from './simpleOutletLogger'
import { createStepOutputLogger } from './step'
import { getParentCode } from './code'
import { normalizeVerbaString } from './string'
import { repeatStr } from './util/string'

const IS_TTY = process.stdout.isTTY === true

/**
 * The spinners, no matter the "nestedness" of a VerbaLogger, all share one terminal,
 * therefore we globally track the current spinner that is occupying the terminal.
 * This could be done better, i.e. abstracting to a generic terminal output occupier
 * interface. For now, however, this will suffice.
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

  const stepLogger = createStepOutputLogger(IS_TTY, parentCode, indentation, indentationString, simpleOutletLoggers, () => {
    currentSpinner = undefined
  })

  return {
    log: msg => NATIVE_OUTLETS.log(normalizeVerbaString(msg)),
    info: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.info(_options, indentationString)
    },
    step: _options => currentSpinner = stepLogger(_options, currentSpinner),
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
