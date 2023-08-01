import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes } from "../../outlet/types"
import { normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { NestState } from "../../types"
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
) => string

const createSimpleOutletLogger = (
  transportOptions: BaseTransportOptions,
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
    return code != null
      ? _prefix + createCodeStr(code, transportOptions) + normalizeVerbaString(outletOptions.msg, transportOptions)
      : _prefix + normalizeVerbaString(outletOptions.msg, transportOptions)
  }

  const override = transportOptions?.simpleOutletOverrides?.[outlet]
  if (override != null)
    return outletOptions => override(outletOptions) || createDefaultOutput(outletOptions)
  
  return outletOptions => {
    return createDefaultOutput(outletOptions)
  }
}

export const createSimpleOutletLoggers = (
  transportOptions: BaseTransportOptions,
  nestState: NestState,
): SimpleOutletLoggers => ({
  info: createSimpleOutletLogger(transportOptions, 'info', nestState),
  step: createSimpleOutletLogger(transportOptions, 'step', nestState),
  success: createSimpleOutletLogger(transportOptions, 'success', nestState),
  warn: createSimpleOutletLogger(transportOptions, 'warn', nestState),
})
