import { AnyOutletOptions, SimpleOutlet, SimpleOutletPrefixes, VerbaLoggerOptions } from "../../types"
import { isVerbaString, normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { NATIVE_OUTLETS } from "./nativeOutlets"
import { createCodeStr } from "../../code"

export type SimpleOutletLoggers = Record<SimpleOutlet, SimpleOutletLogger>

const DEFAULT_SIMPLE_OUTLET_PREFIXES: SimpleOutletPrefixes = {
  info: renderStringWithFormats('i', 'gray', 'bold') + ' ',
  step:  renderStringWithFormats('*', 'cyan', 'bold') + ' ',
  success: renderStringWithFormats('✔', 'green') + ' ',
  warn: renderStringWithFormats('WARN', 'bold', 'underline', 'yellow') + ' ',
  error: renderStringWithFormats('ERROR', 'bold', 'underline', 'red') + ' ',
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

  const nativeLog = NATIVE_OUTLETS.log
  
  return (_options, indentationString) => {
    const _prefix = indentationString + outletPrefix

    if (isVerbaString(_options)) {
      const codeStr = createCodeStr(parentCode)
      nativeLog(_prefix + codeStr + normalizeVerbaString(_options))
      return
    }

    const code = _options.code ?? parentCode
    const codeStr = createCodeStr(code)

    if (Array.isArray(_options.msg)) {
      // eslint-disable-next-line max-len
      nativeLog(_prefix + codeStr + _options.msg.map(s => normalizeVerbaString(s)).join(indentationString))
      return
    }

    nativeLog(_prefix + codeStr + normalizeVerbaString(_options.msg))
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