import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes } from "../../outlet/types"
import { normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { NestState, VerbaLoggerOptions } from "../../types"
import { createCodeStr } from "./code"
import { BaseTransportOptions } from './types'
import { NormalizeVerbaStringOptions } from '../../verbaString/types'

export type SimpleOutletLoggers = Record<SimpleOutlet, SimpleOutletLogger>

const createDefaultSimpleOutletPrefixes = (options?: NormalizeVerbaStringOptions): SimpleOutletPrefixes => ({
  info: renderStringWithFormats('i', ['gray', 'bold'], options) + ' ',
  step:  renderStringWithFormats('*', ['cyan', 'bold'], options) + ' ',
  success: renderStringWithFormats('✔', ['green'], options) + ' ',
  warn: renderStringWithFormats('WARN', ['bold', 'underline', 'yellow'], options) + ' ',
})

type SimpleOutletLogger = (
  options: NormalizedSimpleOutletOptions,
) => void

const createSimpleOutletLogger = (
  transportOptions: BaseTransportOptions,
  options: VerbaLoggerOptions | undefined,
  outlet: SimpleOutlet,
  nestState: NestState,
): SimpleOutletLogger => {
  const outletPrefixFromOptions = transportOptions?.outletPrefixes?.[outlet]
  const outletPrefix = outletPrefixFromOptions != null
    ? normalizeVerbaString(outletPrefixFromOptions, transportOptions)
    : createDefaultSimpleOutletPrefixes(transportOptions)[outlet]
    
  const createDefaultOutput = (outletOptions: NormalizedSimpleOutletOptions)=> {
    const _prefix = nestState.indentationString + outletPrefix
    const code = outletOptions.code ?? nestState.code
    const codeStr = createCodeStr(code, transportOptions)
    return _prefix + codeStr + normalizeVerbaString(outletOptions.msg, transportOptions)
  }

  const override = transportOptions?.simpleOutletOverrides?.[outlet]
  if (override != null) {
    return outletOptions => {
      transportOptions.dispatch(override(outletOptions) || createDefaultOutput(outletOptions))
    }
  }
  
  return outletOptions => {
    transportOptions.dispatch(createDefaultOutput(outletOptions))
  }
}

export const createSimpleOutletLoggers = (
  transportOptions: BaseTransportOptions,
  loggerOptions: VerbaLoggerOptions | undefined,
  nestState: NestState,
): SimpleOutletLoggers => ({
  info: createSimpleOutletLogger(transportOptions, loggerOptions, 'info', nestState),
  step: createSimpleOutletLogger(transportOptions, loggerOptions, 'step', nestState),
  success: createSimpleOutletLogger(transportOptions, loggerOptions, 'success', nestState),
  warn: createSimpleOutletLogger(transportOptions, loggerOptions, 'warn', nestState),
})
