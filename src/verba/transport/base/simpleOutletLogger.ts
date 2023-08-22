import { BaseTransportOptions, BuiltInSimpleOutletPrefixNames } from './types'
import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixes } from "../../outlet/types"
import { createVerbaStringNormalizer, normalizeVerbaString, renderStringWithFormats } from "../../verbaString"

import { CodeRenderer } from './code'
import { DispatchDeltaT } from "./dispatchDeltaT"
import { NestState } from "../../types"
import { SIMPLE_OUTLETS } from "../../outlet"

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
    error: renderStringWithFormats('ERR!', ['bgRed', 'bold'], { disableColors }) + ' ',
  }),
  textual: disableColors => ({
    info: renderStringWithFormats('INFO', ['bgBlack', 'bold'], { disableColors }) + ' ',
    step:  renderStringWithFormats('STEP', ['bgBlue', 'bold'], { disableColors }) + ' ',
    success: renderStringWithFormats('SUCC', ['bgGreen', 'bold'], { disableColors }) + ' ',
    warn: renderStringWithFormats('WARN', ['bgYellow', 'underline', 'bold'], { disableColors }) + ' ',
    error: renderStringWithFormats('ERR!', ['bgRed', 'bold'], { disableColors }) + ' ',
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

export const useSimpleOutletLoggers = (
  transportOptions: BaseTransportOptions,
  nestState: NestState,
  renderCode: CodeRenderer | undefined,
  renderDispatchTime: () => string,
  dispatchDeltaT: DispatchDeltaT | undefined,
): { [k in SimpleOutlet]: ((options: NormalizedSimpleOutletOptions) => void) } => {
  const _normalizeVerbaString = createVerbaStringNormalizer(transportOptions)

  const createLog = (outlet: SimpleOutlet): ((options: NormalizedSimpleOutletOptions) => void) => {
    const prefix = nestState.indentationString + determineSimpleOutletPrefix(transportOptions, outlet)
    const baseContentRenderer: ((options: NormalizedSimpleOutletOptions) => void) = renderCode != null
      ? options => prefix + _normalizeVerbaString(renderCode(options.code, nestState.code)) + _normalizeVerbaString(options.msg)
      : options => prefix + _normalizeVerbaString(options.msg)

    return dispatchDeltaT != null
      ? dispatchDeltaT.position === 'start'
        ? options => transportOptions.dispatch(renderDispatchTime() + dispatchDeltaT.render() + baseContentRenderer(options))
        : options => transportOptions.dispatch(renderDispatchTime() + baseContentRenderer(options) + dispatchDeltaT.render())
      : options => transportOptions.dispatch(renderDispatchTime() + baseContentRenderer(options))
  }

  const result: { [k in SimpleOutlet]: ((options: NormalizedSimpleOutletOptions) => void) } = { } as any
  SIMPLE_OUTLETS.forEach(outlet => result[outlet] = createLog(outlet))
  return result
}
