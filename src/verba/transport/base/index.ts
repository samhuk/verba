import { NestedInstantiatedVerbaTransport, VerbaTransport } from '../types'
import { getColorizer, normalizeVerbaString } from '../../verbaString'

import { BaseTransportOptions } from './types'
import columify from 'columnify'
import { createCodeRenderer } from './code'
import { createDataRenderer } from './data'
import { createDispatchTimeRenderer } from './dispatchTime'
import { createJsonRenderer } from './json'
import { repeatStr } from '../../util/string'
import { useDispatchDeltaT } from './dispatchDeltaT'
import { useProgressBarLogger } from './progressBar'
import { useSimpleOutletLoggers } from './simpleOutletLogger'
import { useSpinnerLogger } from './spinner'
import { useTtyConsoleOccupierRef } from './ttyConsoleOccupier'

/**
 * A Verba Transport for typical console and file transports, supporting TTY and non-TTY environments.
 */
export const baseTransport = <
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
>(
  transportOptions: BaseTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => (loggerOptions, listeners, registerOnClose) => {
  const _transportOptions = transportOptions as BaseTransportOptions
  const ttyConsoleOccupierRef = useTtyConsoleOccupierRef(_transportOptions, listeners)
  const colorizer = getColorizer(transportOptions)
  const dispatchDeltaT = useDispatchDeltaT(_transportOptions, colorizer, listeners)
  const renderDispatchTime = createDispatchTimeRenderer(_transportOptions, colorizer)
  const renderJson = createJsonRenderer(colorizer)
  const renderCode = createCodeRenderer(_transportOptions)
  const renderData = createDataRenderer(_transportOptions, renderJson)

  if (transportOptions.onClose != null)
    registerOnClose(transportOptions.onClose)

  return nestState => {
    const simpleOutletLoggers = useSimpleOutletLoggers(_transportOptions, nestState, renderCode, renderDispatchTime, dispatchDeltaT, renderData)
    const progressBar = useProgressBarLogger(_transportOptions, ttyConsoleOccupierRef, nestState, renderDispatchTime)
    const spinner = useSpinnerLogger(_transportOptions, ttyConsoleOccupierRef, nestState, simpleOutletLoggers.step, renderCode, renderDispatchTime)

    const transport: NestedInstantiatedVerbaTransport = {
      log: _options => transportOptions.dispatch(normalizeVerbaString(_options.msg, transportOptions)),
      // -- Simple outlets
      info: simpleOutletLoggers.info,
      step: simpleOutletLoggers.step,
      success: simpleOutletLoggers.success,
      warn: simpleOutletLoggers.warn,
      error: simpleOutletLoggers.error,
      // -- Other outlets
      table: (data, _options) => transportOptions.dispatch(columify(data, _options)),
      json: (value, _options) => transportOptions.dispatch(renderJson(value, _options.pretty)),
      spacer: _options => transportOptions.dispatch(repeatStr('\n', _options.numLines - 1)),
      divider: () => transportOptions.dispatch(repeatStr('-', process.stdout.columns * 0.33)),
      spinner,
      progressBar,
    }

    return transport
  }
}
