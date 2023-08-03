import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes } from "../../outlet/types"
import { normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { BaseTransportOptions } from './types'
import { DispatchDeltaT } from "./dispatchDeltaT"
import { NestState } from "../../types"
import { SIMPLE_OUTLETS } from "../../outlet"
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

const createBaseSimpleOutletLogger = (
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

export const useSimpleOutletLoggers = (
  transportOptions: BaseTransportOptions,
  nestState: NestState,
  renderDispatchTime: () => void,
  dispatchDeltaT: DispatchDeltaT | undefined,
): { [k in SimpleOutlet]: ((options: NormalizedSimpleOutletOptions) => void) } => {
  const log = (simpleOutlet: SimpleOutlet): ((options: NormalizedSimpleOutletOptions) => void) => {
    const baseLogger = createBaseSimpleOutletLogger(transportOptions, simpleOutlet, nestState)
    return dispatchDeltaT != null
      ? dispatchDeltaT.position === 'start'
        ? options => transportOptions.dispatch(renderDispatchTime() + dispatchDeltaT.render() + baseLogger(options))
        : options => transportOptions.dispatch(renderDispatchTime() + baseLogger(options) + dispatchDeltaT.render())
      : options => transportOptions.dispatch(renderDispatchTime() + baseLogger(options))
  }

  const result: { [k in SimpleOutlet]: ((options: NormalizedSimpleOutletOptions) => void) } = { } as any
  SIMPLE_OUTLETS.forEach(outlet => result[outlet] = log(outlet))
  return result
}
