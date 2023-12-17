import { NestedInstantiatedVerbaTransport, VerbaTransport } from '../types'
import { getColorizer, normalizeVerbaString, renderStringWithFormats } from '../../verbaString'

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

const normalizePrefix = (prefix: BaseTransportOptions['prefix']): string | undefined => {
  if (prefix == null)
    return undefined

  if (typeof prefix === 'string')
    return prefix

  return renderStringWithFormats(prefix.text, prefix.formats ?? [])
}

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
  const renderDispatchTime = createDispatchTimeRenderer(_transportOptions)
  const renderJson = createJsonRenderer(colorizer)
  const renderCode = createCodeRenderer(_transportOptions)
  const renderData = createDataRenderer(_transportOptions, renderJson)

  if (transportOptions.onClose != null)
    registerOnClose(transportOptions.onClose)

  // Handle prefix
  const prefix = normalizePrefix(transportOptions.prefix)
  const dispatch: typeof transportOptions.dispatch = prefix != null
    ? msg => transportOptions.dispatch(msg.split('\n').map(msgLine => `${prefix}${msgLine}`).join('\n'))
    : transportOptions.dispatch

  return nestState => {
    // eslint-disable-next-line max-len
    const simpleOutletLoggers = useSimpleOutletLoggers(_transportOptions, nestState, renderCode, renderDispatchTime, dispatchDeltaT, renderData, dispatch)
    const progressBar = useProgressBarLogger(_transportOptions, ttyConsoleOccupierRef, nestState, renderDispatchTime, prefix)
    // eslint-disable-next-line max-len
    const spinner = useSpinnerLogger(_transportOptions, ttyConsoleOccupierRef, nestState, simpleOutletLoggers.step, renderCode, renderDispatchTime, prefix)

    const table: NestedInstantiatedVerbaTransport['table'] = _transportOptions.disableColors
      ? ((data, _options) => dispatch(columify(data, _options)))
      : ((data, _options) => dispatch(
        columify(
          data,
          _options.headingTransform != null ? _options : {..._options, headingTransform: s => renderStringWithFormats(s, ['bold', 'underline']) },
        ),
      ))

    const transport: NestedInstantiatedVerbaTransport = {
      log: _options => dispatch(normalizeVerbaString(_options.msg, transportOptions)),
      // -- Simple outlets
      info: simpleOutletLoggers.info,
      step: simpleOutletLoggers.step,
      success: simpleOutletLoggers.success,
      warn: simpleOutletLoggers.warn,
      error: simpleOutletLoggers.error,
      // -- Other outlets
      table,
      json: (value, _options) => dispatch(renderJson(value, _options.pretty)),
      spacer: _options => dispatch(repeatStr('\n', _options.numLines - 1)),
      divider: () => dispatch(repeatStr('-', process.stdout.columns * 0.33)),
      spinner,
      progressBar,
    }

    return transport
  }
}
