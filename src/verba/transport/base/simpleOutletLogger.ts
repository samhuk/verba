import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes } from "../../outlet/types"
import { normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { BaseTransportOptions } from './types'
import { NestState } from "../../types"
import { createCodeStr } from "./code"

type SimpleOutletLogger = (
  options: NormalizedSimpleOutletOptions,
) => string

export type SimpleOutletLoggers = Record<SimpleOutlet, SimpleOutletLogger>

const createDefaultSimpleOutletPrefixes = (disableColors: boolean): SimpleOutletPrefixes => ({
  info: renderStringWithFormats('i', ['gray', 'bold'], { disableColors }) + ' ',
  step:  renderStringWithFormats('*', ['cyan', 'bold'], { disableColors }) + ' ',
  success: renderStringWithFormats('✔', ['green'], { disableColors }) + ' ',
  warn: renderStringWithFormats('WARN', ['bold', 'underline', 'yellow'], { disableColors }) + ' ',
})

const DEFAULT_COLORED_SIMPLE_OUTLET_PREFIXES = createDefaultSimpleOutletPrefixes(false)
const DEFAULT_COLORLESS_SIMPLE_OUTLET_PREFIXES = createDefaultSimpleOutletPrefixes(true)

const getDefaultSimpleOutletPrefixes = (disableColors: boolean) => disableColors
  ? DEFAULT_COLORLESS_SIMPLE_OUTLET_PREFIXES
  : DEFAULT_COLORED_SIMPLE_OUTLET_PREFIXES

const determineSimpleOutletPrefix = (options: BaseTransportOptions, outlet: SimpleOutlet) => {
  const outletPrefixFromOptions = options.outletPrefixes?.[outlet]
  return outletPrefixFromOptions != null
    ? normalizeVerbaString(outletPrefixFromOptions, options)
    : getDefaultSimpleOutletPrefixes(options.disableColors)[outlet]
}

const createSimpleOutletLogger = (
  transportOptions: BaseTransportOptions,
  outlet: SimpleOutlet,
  nestState: NestState,
): SimpleOutletLogger => {
  const prefix = nestState.indentationString + determineSimpleOutletPrefix(transportOptions, outlet)
  const createDefaultOutput = (outletOptions: NormalizedSimpleOutletOptions)=> {
    const code = outletOptions.code ?? nestState.code
    return code != null
      ? prefix + createCodeStr(code, transportOptions) + normalizeVerbaString(outletOptions.msg, transportOptions)
      : prefix + normalizeVerbaString(outletOptions.msg, transportOptions)
  }

  const override = transportOptions?.simpleOutletOverrides?.[outlet]
  return override != null
    ? outletOptions => override(outletOptions) || createDefaultOutput(outletOptions)
    : outletOptions => createDefaultOutput(outletOptions)
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
