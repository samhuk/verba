import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes } from "../../outlet/types"
import { normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { BaseTransportOptions, BuiltInSimpleOutletPrefixNames } from './types'
import { DispatchDeltaT } from "./dispatchDeltaT"
import { NestState } from "../../types"
import { SIMPLE_OUTLETS } from "../../outlet"
import { renderCode } from "./code"

type SimpleOutletLogger = (
  options: NormalizedSimpleOutletOptions,
) => string

export type SimpleOutletLoggers = Record<SimpleOutlet, SimpleOutletLogger>

type SimpleOutletPrefixesCreator = (disableColors: boolean) => SimpleOutletPrefixes

const BUILT_IN_SIMPLE_OUTLET_PREFIX_CREATORS: Record<BuiltInSimpleOutletPrefixNames, SimpleOutletPrefixesCreator> = {
  default: disableColors => ({
    info: renderStringWithFormats('i', ['gray', 'bold'], { disableColors }) + ' ',
    step:  renderStringWithFormats('*', ['cyan', 'bold'], { disableColors }) + ' ',
    success: renderStringWithFormats('✔', ['green'], { disableColors }) + ' ',
    warn: renderStringWithFormats('WARN', ['bold', 'underline', 'yellow'], { disableColors }) + ' ',
  }),
  textual: disableColors => ({
    info: renderStringWithFormats('INFO', ['bgBlack', 'bold'], { disableColors }) + ' ',
    step:  renderStringWithFormats('STEP', ['bgBlue', 'bold'], { disableColors }) + ' ',
    success: renderStringWithFormats('SUCC', ['bgGreen', 'bold'], { disableColors }) + ' ',
    warn: renderStringWithFormats('WARN', ['bgYellow', 'underline', 'bold'], { disableColors }) + ' ',
  }),
}

const BUILT_IN_SIMPLE_OUTLET_PREFIXES: Record<BuiltInSimpleOutletPrefixNames, Record<'true' | 'false', SimpleOutletPrefixes>> = {} as any
Object.entries(BUILT_IN_SIMPLE_OUTLET_PREFIX_CREATORS)
  .forEach(([name, creator]) => BUILT_IN_SIMPLE_OUTLET_PREFIXES[name as BuiltInSimpleOutletPrefixNames] = {
    true: creator(true),
    false: creator(false),
  })

const determineSimpleOutletPrefix = (options: BaseTransportOptions, outlet: SimpleOutlet): string => {
  const disableColors = String(options.disableColors) as 'true' | 'false'
  if (typeof options.outletPrefixes === 'string')
    return BUILT_IN_SIMPLE_OUTLET_PREFIXES[options.outletPrefixes][disableColors][outlet]

  const userDefinedPrefix = options.outletPrefixes?.[outlet]
  return userDefinedPrefix != null
    ? normalizeVerbaString(userDefinedPrefix, options)
    : BUILT_IN_SIMPLE_OUTLET_PREFIXES.default[disableColors][outlet]
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
      ? prefix + renderCode(code, transportOptions) + normalizeVerbaString(outletOptions.msg, transportOptions)
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
