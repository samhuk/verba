import { AnyOutletOptions, BaseOutletOptions, NestOptions, SimpleOutlet, SimpleOutletPrefixes, VerbaLogger, VerbaLoggerOptions } from './types'
import { Spinner, SpinnerOptions } from './spinner/types'

import { NATIVE_OUTLETS } from './outlet'
import columify from 'columnify'
import { createCodeStr } from './code'
import { createIndentationString } from './util/indentation'
import { createSimpleOutletLoggers } from './simpleOutlet'
import { createSpinner } from './spinner'
import { normalizeVerbaString } from './string'
import { repeatStr } from './util/string'

const getParentCode = (
  nestOptionsList: NestOptions[],
): string | number | undefined => {
  for (let i = nestOptionsList.length; i >= 0; i -= 1) {
    if (nestOptionsList[i]?.code != null)
      return nestOptionsList[i].code
  }

  return undefined
}

const logStepWithSpinner = (
  options: (BaseOutletOptions & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  parentCode: string | number | undefined,
  indentation: number,
  indentationString: string,
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
    destroy: spinner.destroy,
    stopAndPersist: () => spinner.stopAndPersist(),
  }
}

const _createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
>(options: TOptions, nestOptionsList: NestOptions<TCode>[]): VerbaLogger<TOptions, TCode, TData> => {
  const indentation = nestOptionsList.reduce((acc, no) => acc + (no.indent ?? 0), 0)
  const indentationString = createIndentationString(indentation)

  const parentCode = getParentCode(nestOptionsList)

  const simpleOutletLoggers = createSimpleOutletLoggers(options)

  let currentSpinner: Spinner | undefined

  return {
    log: msg => NATIVE_OUTLETS.log(normalizeVerbaString(msg)),
    info: _options => {
      currentSpinner?.clear()
      simpleOutletLoggers.info(_options, parentCode, indentationString)
    },
    step: _options => {
      if (typeof _options === 'object' && _options.spinner) {
        currentSpinner = logStepWithSpinner(_options as any, parentCode, indentation, indentationString)
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
