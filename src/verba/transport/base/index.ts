import { NestedInstantiatedVerbaTransport, VerbaTransport } from "../types"
import { getColorizer, normalizeVerbaString } from "../../verbaString"

import { BaseTransportOptions } from './types'
import { NormalizedSimpleOutletOptions } from "../../outlet/types"
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createDispatchTimeRenderer } from './dispatchTime'
import { createProgressBarLogger } from './progressBar'
import { createStepLogger } from "./step"
import { determineJsonColors } from './json'
import { repeatStr } from "../../util/string"
import { useDispatchDeltaT } from './dispatchDeltaT'
import { useSimpleOutletLoggers } from "./simpleOutletLogger"
import { useTtyConsoleOccupierRef } from './ttyConsoleOccupier'

const useLog = (transportOptions: BaseTransportOptions) => (_options: NormalizedSimpleOutletOptions) => (
  transportOptions.dispatch(normalizeVerbaString(_options.msg, transportOptions))
)

/**
 * A Verba Transport for typical console and file transports, supporting TTY and non-TTY terminals.
 */
export const baseTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(
  transportOptions: BaseTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => (loggerOptions, listeners) => {
  const jsonColors = determineJsonColors(transportOptions as BaseTransportOptions)
  const ttyConsoleOccupierRef = useTtyConsoleOccupierRef(transportOptions as BaseTransportOptions, listeners)
  const colorizer = getColorizer(transportOptions)
  const dispatchDeltaT = useDispatchDeltaT(transportOptions as BaseTransportOptions, colorizer, listeners)
  const renderDispatchTime = createDispatchTimeRenderer(transportOptions as BaseTransportOptions, colorizer)

  return nestState => {
    const simpleOutletLoggers = useSimpleOutletLoggers(transportOptions as BaseTransportOptions, nestState, renderDispatchTime, dispatchDeltaT)
    const progressBar = createProgressBarLogger(transportOptions as BaseTransportOptions, ttyConsoleOccupierRef, nestState, renderDispatchTime)

    const transport: NestedInstantiatedVerbaTransport = {
      // -- Simple outlets
      log: useLog(transportOptions as BaseTransportOptions),
      info: simpleOutletLoggers.info,
      // eslint-disable-next-line max-len
      step: createStepLogger(transportOptions as any, nestState, simpleOutletLoggers.step, ttyConsoleOccupierRef) as any,
      success: simpleOutletLoggers.success,
      warn: simpleOutletLoggers.warn,
      // -- Other outlets
      table: (data, _options) => transportOptions.dispatch(columify(data, _options)),
      json: (value, _options) => transportOptions.dispatch(colorizeJson(value, {
        pretty: _options.pretty,
        colors: jsonColors,
      })),
      spacer: _options => transportOptions.dispatch(repeatStr('\n', _options.numLines - 1)),
      divider: () => transportOptions.dispatch(repeatStr('-', process.stdout.columns * 0.33)),
      progressBar,
    }

    return transport
  }
}
