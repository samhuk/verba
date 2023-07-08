import { createSpinner } from './spinner'
import { Spinner } from './spinner/types'
import { normalizeVerbaString, renderFancyString } from './string'
import { StringFormat } from './string/types'
import { AnyOutletOptions, NestOptions, VerbaLogger, VerbaLoggerOptions } from './types'
import { createIndentationString } from './util/indentation'
import { repeatStr } from './util/string'

const baseLog = (
  prefix: string,
  indentationString: string,
  options: AnyOutletOptions,
) => {
  if (typeof options !== 'object') {
    console.log(indentationString + prefix + normalizeVerbaString(options))
    return
  }

  const codeStr = options.code != null
    ? `${renderFancyString(c => c.magenta(String(options.code)))} `
    : ''

  if (Array.isArray(options.msg)) {
    // eslint-disable-next-line max-len
    console.log(indentationString + prefix + codeStr + options.msg.map(s => normalizeVerbaString(s)).join(indentationString))
    return
  }

  console.log(indentationString + prefix + codeStr + normalizeVerbaString(options.msg))
}

const createOutletPrefix = (name: string, format: StringFormat) => renderFancyString(c => `${c[format](c.bold(name))} `)

const _createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
>(options: TOptions, nestOptionsList: NestOptions<TCode>[]): VerbaLogger<TOptions, TCode, TData> => {
  const indentation = nestOptionsList.reduce((acc, no) => acc + (no.indent ?? 0), 0)
  const indentationString = createIndentationString(indentation)

  const infoOutletPrefix = createOutletPrefix('i', 'gray')
  const stepOutletPrefix = createOutletPrefix('*', 'cyan')
  const successOutletPrefix = createOutletPrefix('✔', 'green')
  const warnOutletPrefix = renderFancyString(c => `${c.yellow(c.underline(c.bold('WARN')))} `)

  return {
    log: msg => {
      console.log(normalizeVerbaString(msg))
    },
    info: _options => {
      baseLog(infoOutletPrefix, indentationString, _options)
    },
    step: _options => {
      const showSpinner = typeof _options === 'object' && (_options?.spinner != null && _options?.spinner !== false)
      if (!showSpinner) {
        baseLog(stepOutletPrefix, indentationString, _options)
        return undefined as any
      }

      const codeStr = _options.code != null
        ? `${renderFancyString(c => c.magenta(String(_options.code)))} `
        : ''

      const msgNoCode = Array.isArray(_options.msg)
        ? _options.msg.map(s => normalizeVerbaString(s)).join(`\n${indentationString}`)
        : normalizeVerbaString(_options.msg)

      const spinner = createSpinner(
        typeof _options.spinner === 'boolean'
          ? {
            text: codeStr + msgNoCode,
            color: 'cyan',
            indentation: nestOptions.indent,
          }
          : { ..._options.spinner, indentation: _options.spinner?.indentation ?? nestOptions.indent },
      )
      const wrappedSpinner: Spinner = {
        color: spinner.color,
        stop: spinner.stop,
        text: s => spinner.text(_options.code != null ? s : codeStr + normalizeVerbaString(s)),
      }
      return wrappedSpinner
    },
    success: _options => {
      baseLog(successOutletPrefix, indentationString, _options)
    },
    warn: _options => {
      baseLog(warnOutletPrefix, indentationString, _options)
    },
    error: _options => undefined,
    table: _options => undefined,
    nest: _options => _createVerbaLogger(options, nestOptionsList.concat(_options)),
    divider: () => console.log(repeatStr('-', process.stdout.columns / 2)),
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
