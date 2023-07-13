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
  indentationString: string,
) => void

const createSimpleOutletLogger = (
  options: VerbaLoggerOptions | undefined,
  outlet: SimpleOutlet,
  parentCode: string | number | undefined,
): SimpleOutletLogger => {
  const outletPrefixFromOptions = options?.outletPrefixes?.[outlet]
  const outletPrefix = outletPrefixFromOptions != null
    ? normalizeVerbaString(outletPrefixFromOptions)
    : DEFAULT_SIMPLE_OUTLET_PREFIXES[outlet]

  const nativeOutlet = NATIVE_OUTLETS.log
  
  return (_options, indentationString) => {
    const _prefix = indentationString + outletPrefix

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

export const createSimpleOutletLoggers = (
  options: VerbaLoggerOptions | undefined,
  parentCode: string | number | undefined,
): Record<SimpleOutlet, SimpleOutletLogger> => ({
  info: createSimpleOutletLogger(options, 'info', parentCode),
  step: createSimpleOutletLogger(options, 'step', parentCode),
  success: createSimpleOutletLogger(options, 'success', parentCode),
  warn: createSimpleOutletLogger(options, 'warn', parentCode),
  error: createSimpleOutletLogger(options, 'error', parentCode),
})
