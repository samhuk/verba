import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes, VerbaLoggerOptions } from "../../types"
import { normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { NATIVE_OUTLETS } from "./nativeOutlets"
import { createCodeStr } from "./code"

export type SimpleOutletLoggers = Record<SimpleOutlet, SimpleOutletLogger>

const DEFAULT_SIMPLE_OUTLET_PREFIXES: SimpleOutletPrefixes = {
  info: renderStringWithFormats('i', ['gray', 'bold']) + ' ',
  step:  renderStringWithFormats('*', ['cyan', 'bold']) + ' ',
  success: renderStringWithFormats('✔', ['green']) + ' ',
  warn: renderStringWithFormats('WARN', ['bold', 'underline', 'yellow']) + ' ',
}

type SimpleOutletLogger = (
  options: NormalizedSimpleOutletOptions,
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
    const code = _options.code ?? parentCode
    const codeStr = createCodeStr(code)
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
})
