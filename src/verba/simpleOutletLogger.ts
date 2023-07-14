import { AnyOutletOptions, SimpleOutlet, SimpleOutletPrefixes, VerbaLoggerOptions } from "./types"
import { normalizeVerbaString, renderFancyString, renderFancyStringWithFormats } from "./string"

import { NATIVE_OUTLETS } from "./nativeOutlets"
import { createCodeStr } from "./code"

export type SimpleOutletLoggers = Record<SimpleOutlet, SimpleOutletLogger>

const DEFAULT_SIMPLE_OUTLET_PREFIXES: SimpleOutletPrefixes = {
  info: renderFancyStringWithFormats('i', 'gray', 'bold') + ' ',
  step:  renderFancyStringWithFormats('*', 'cyan', 'bold') + ' ',
  success: renderFancyStringWithFormats('✔', 'green') + ' ',
  warn: renderFancyStringWithFormats('WARN', 'bold', 'underline', 'yellow') + ' ',
  error: renderFancyStringWithFormats('ERROR', 'bold', 'underline', 'red') + ' ',
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
): SimpleOutletLoggers => ({
  info: createSimpleOutletLogger(options, 'info', parentCode),
  step: createSimpleOutletLogger(options, 'step', parentCode),
  success: createSimpleOutletLogger(options, 'success', parentCode),
  warn: createSimpleOutletLogger(options, 'warn', parentCode),
  error: createSimpleOutletLogger(options, 'error', parentCode),
})
