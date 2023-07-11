import { AnyOutletOptions, SimpleOutlet, SimpleOutletPrefixes, VerbaLoggerOptions } from "./types"
import { normalizeVerbaString, renderFancyString } from "./string"

import { NATIVE_OUTLETS } from "./outlet"
import { StringFormat } from "./string/types"
import { createCodeStr } from "./code"

const createOutletPrefix = (name: string, format: StringFormat) => renderFancyString(c => `${c[format](c.bold(name))} `)

const DEFAULT_SIMPLE_OUTLET_PREFIXES: SimpleOutletPrefixes = {
  info: createOutletPrefix('i', 'gray'),
  step:  createOutletPrefix('*', 'cyan'),
  success: createOutletPrefix('✔', 'green'),
  warn: renderFancyString(c => `${c.yellow(c.underline(c.bold('WARN')))} `),
  error: '',
}

type SimpleOutletLogger = (
  options: AnyOutletOptions,
  parentCode: string | number | undefined,
  indentationString: string,
  hasActiveLoggingStatement?: boolean
) => void

const createSimpleOutletLogger = (
  options: VerbaLoggerOptions | undefined,
  outlet: SimpleOutlet,
): SimpleOutletLogger => {
  const outletPrefixFromOptions = options?.outletPrefixes?.[outlet]
  const outletPrefix = outletPrefixFromOptions != null
    ? normalizeVerbaString(outletPrefixFromOptions)
    : DEFAULT_SIMPLE_OUTLET_PREFIXES[outlet]

  const nativeOutlet = NATIVE_OUTLETS.log
  
  return (_options, parentCode, indentationString, hasActiveLoggingStatement) => {
    const _prefix = (hasActiveLoggingStatement ? '\n' : '') + indentationString + outletPrefix

    if (typeof _options !== 'object') {
      const codeStr = createCodeStr(parentCode)
      nativeOutlet(_prefix + codeStr + normalizeVerbaString(_options))
      return
    }

    const code = _options.code ?? parentCode
    const codeStr = createCodeStr(code)

    if (Array.isArray(_options.msg)) {
      // eslint-disable-next-line max-len
      nativeOutlet(_prefix + codeStr + _options.msg.map(s => normalizeVerbaString(s)).join(indentationString))
      return
    }

    nativeOutlet(_prefix + codeStr + normalizeVerbaString(_options.msg))
  }
}

export const createSimpleOutletLoggers = (options: VerbaLoggerOptions | undefined): Record<SimpleOutlet, SimpleOutletLogger> => ({
  info: createSimpleOutletLogger(options, 'info'),
  step: createSimpleOutletLogger(options, 'step'),
  success: createSimpleOutletLogger(options, 'success'),
  warn: createSimpleOutletLogger(options, 'warn'),
  error: createSimpleOutletLogger(options, 'error'),
})
