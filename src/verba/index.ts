import { BaseOutletOptions, NestOptions, VerbaLogger, VerbaLoggerOptions } from './types'
import { Spinner, SpinnerOptions } from './spinner/types'
import { createCodeStr, getParentCode } from './code'

import { NATIVE_OUTLETS } from './outlet'
import columify from 'columnify'
import { createIndentationString } from './util/indentation'
import { createSimpleOutletLoggers } from './simpleOutlet'
import { createSpinner } from './spinner'
import { normalizeVerbaString } from './string'
import { repeatStr } from './util/string'

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

  const simpleOutletLoggers = createSimpleOutletLoggers(options)

  return {
    log: msg => NATIVE_OUTLETS.log(normalizeVerbaString(msg)),
    info: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.info(_options, parentCode, indentationString)
    },
    step: _options => {
      if (typeof _options === 'object' && _options.spinner) {
        currentSpinner?.destroy()
        currentSpinner = logStepWithSpinner(_options as any, parentCode, indentation, indentationString, () => {
          currentSpinner = undefined
        })
        return currentSpinner
      }
      
      currentSpinner?.clear()
      simpleOutletLoggers.step(_options, parentCode, indentationString)
      return undefined as any
    },
    success: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.success(_options, parentCode, indentationString)
    },
    warn: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.warn(_options, parentCode, indentationString)
    },
    // error: _options => undefined,
    table: (data, _options) => {
      currentSpinner?.clear()
      NATIVE_OUTLETS.log(columify(data, _options))
    },
    nest: _options => _createVerbaLogger(options, nestOptionsList.concat(_options)),
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

export const createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
// eslint-disable-next-line arrow-body-style
>(options?: TOptions): VerbaLogger<TOptions, TCode, TData> => _createVerbaLogger(
    options ?? { },
    [],
  )
