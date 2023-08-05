import { NestedInstantiatedVerbaTransport, VerbaTransport } from "../types"
import { getColorizer, normalizeVerbaString } from "../../verbaString"

import { BaseTransportOptions } from './types'
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createDispatchTimeRenderer } from './dispatchTime'
import { useProgressBarLogger } from './progressBar'
import { useStepLogger } from "./step"
import { determineJsonColors } from './json'
import { repeatStr } from "../../util/string"
import { useDispatchDeltaT } from './dispatchDeltaT'
import { useSimpleOutletLoggers } from "./simpleOutletLogger"
import { useTtyConsoleOccupierRef } from './ttyConsoleOccupier'
import { createCodeRenderer } from './code'

/**
 * A Verba Transport for typical console and file transports, supporting TTY and non-TTY terminals.
 */
export const baseTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(
  transportOptions: BaseTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => (loggerOptions, listeners, registerOnClose) => {
  const _transportOptions = transportOptions as BaseTransportOptions
  const jsonColors = determineJsonColors(_transportOptions)
  const ttyConsoleOccupierRef = useTtyConsoleOccupierRef(_transportOptions, listeners)
  const colorizer = getColorizer(transportOptions)
  const dispatchDeltaT = useDispatchDeltaT(_transportOptions, colorizer, listeners)
  const renderDispatchTime = createDispatchTimeRenderer(_transportOptions, colorizer)
  const renderCode = createCodeRenderer(_transportOptions)

  if (transportOptions.onClose != null)
    registerOnClose(transportOptions.onClose)

  return nestState => {
    const simpleOutletLoggers = useSimpleOutletLoggers(_transportOptions, nestState, renderCode, renderDispatchTime, dispatchDeltaT)
    const progressBar = useProgressBarLogger(_transportOptions, ttyConsoleOccupierRef, nestState, renderDispatchTime)
    const step = useStepLogger(_transportOptions, nestState, simpleOutletLoggers.step, ttyConsoleOccupierRef, renderCode, renderDispatchTime) as any

    const transport: NestedInstantiatedVerbaTransport = {
      // -- Simple outlets
      log: _options => transportOptions.dispatch(normalizeVerbaString(_options.msg, transportOptions)),
      info: simpleOutletLoggers.info,
      // eslint-disable-next-line max-len
      step,
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
