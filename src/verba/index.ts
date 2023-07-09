import columify from 'columnify'

import { AnyOutletOptions, NestOptions, SimpleOutletPrefixes, SimpleOutletPrefixesOptions, VerbaLogger, VerbaLoggerOptions } from './types'
import { normalizeVerbaString, renderFancyString } from './string'
import { Spinner } from './spinner/types'
import { StringFormat } from './string/types'
import { createIndentationString } from './util/indentation'
import { createSpinner } from './spinner'
import { repeatStr } from './util/string'

const createOutletPrefix = (name: string, format: StringFormat) => renderFancyString(c => `${c[format](c.bold(name))} `)

const DEFAULT_SIMPLE_OUTLET_PREFIXES: SimpleOutletPrefixes = {
  info: createOutletPrefix('i', 'gray'),
  step:  createOutletPrefix('*', 'cyan'),
  success: createOutletPrefix('✔', 'green'),
  warn: renderFancyString(c => `${c.yellow(c.underline(c.bold('WARN')))} `),
  error: '',
}

const createCodeStr = (code: string | number | undefined) => (code != null
  ? `${renderFancyString(c => c.magenta(String(code)))} `
  : '')

const baseLog = (
  prefix: string,
  indentationString: string,
  options: AnyOutletOptions,
  baseCode: string | number | undefined,
) => {
  if (typeof options !== 'object') {
    const codeStr = createCodeStr(baseCode)
    console.log(indentationString + prefix + codeStr + normalizeVerbaString(options))
    return
  }

  const code = options.code ?? baseCode
  const codeStr = createCodeStr(code)

  if (Array.isArray(options.msg)) {
    // eslint-disable-next-line max-len
    console.log(indentationString + prefix + codeStr + options.msg.map(s => normalizeVerbaString(s)).join(indentationString))
    return
  }

  console.log(indentationString + prefix + codeStr + normalizeVerbaString(options.msg))
}

const getBaseCode = (
  nestOptionsList: NestOptions[],
): string | number | undefined => {
  for (let i = nestOptionsList.length; i >= 0; i -= 1) {
    if (nestOptionsList[i]?.code != null)
      return nestOptionsList[i].code
  }

  return undefined
}

const mergeProvidedSimpleOutletPrefixesWithDefaults = (outletPrefixes: SimpleOutletPrefixesOptions | undefined): SimpleOutletPrefixes => ({
  info: outletPrefixes?.info != null ? normalizeVerbaString(outletPrefixes?.info) : DEFAULT_SIMPLE_OUTLET_PREFIXES.info,
  step: outletPrefixes?.step != null ? normalizeVerbaString(outletPrefixes?.step) : DEFAULT_SIMPLE_OUTLET_PREFIXES.step,
  success: outletPrefixes?.success != null ? normalizeVerbaString(outletPrefixes?.success) : DEFAULT_SIMPLE_OUTLET_PREFIXES.success,
  warn: outletPrefixes?.warn != null ? normalizeVerbaString(outletPrefixes?.warn) : DEFAULT_SIMPLE_OUTLET_PREFIXES.warn,
  error: outletPrefixes?.error != null ? normalizeVerbaString(outletPrefixes?.error) : DEFAULT_SIMPLE_OUTLET_PREFIXES.error,
})

const _createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
>(options: TOptions, nestOptionsList: NestOptions<TCode>[]): VerbaLogger<TOptions, TCode, TData> => {
  const indentation = nestOptionsList.reduce((acc, no) => acc + (no.indent ?? 0), 0)
  const indentationString = createIndentationString(indentation)

  const baseCode = getBaseCode(nestOptionsList)

  const simpleOutletPrefixes = mergeProvidedSimpleOutletPrefixesWithDefaults(options.outletPrefixes)

  return {
    log: msg => console.log(normalizeVerbaString(msg)),
    info: _options => {
      baseLog(simpleOutletPrefixes.info, indentationString, _options, baseCode)
    },
    step: _options => {
      const showSpinner = typeof _options === 'object' && (_options?.spinner != null && _options?.spinner !== false)
      if (!showSpinner) {
        baseLog(simpleOutletPrefixes.step, indentationString, _options, baseCode)
        return undefined as any
      }

      const code = _options.code ?? baseCode
      const codeStr = createCodeStr(code)
      const msg = Array.isArray(_options.msg)
        ? _options.msg.map(s => normalizeVerbaString(s)).join(`\n${indentationString}`)
        : normalizeVerbaString(_options.msg)

      const spinner = createSpinner(
        typeof _options.spinner === 'boolean'
          ? {
            text: codeStr + msg,
            color: 'cyan',
            indentation,
          }
          : {
            ..._options.spinner,
            indentation: _options.spinner?.indentation ?? indentation,
          },
      )

      const wrappedSpinner: Spinner = {
        text: s => spinner.text(code != null ? codeStr + normalizeVerbaString(s) : s),
        color: spinner.color,
        stop: spinner.stop,
        stopAndPersist: () => spinner.stopAndPersist(),
      }

      return wrappedSpinner
    },
    success: _options => {
      baseLog(simpleOutletPrefixes.success, indentationString, _options, baseCode)
    },
    warn: _options => {
      baseLog(simpleOutletPrefixes.warn, indentationString, _options, baseCode)
    },
    // error: _options => undefined,
    table: (data, _options) => {
      console.log(columify(data, _options))
    },
    nest: _options => _createVerbaLogger(options, nestOptionsList.concat(_options)),
    divider: () => console.log(repeatStr('-', process.stdout.columns * 0.33)),
    spacer: numLines => console.log(repeatStr('\n', (numLines ?? 1 - 1))),
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
