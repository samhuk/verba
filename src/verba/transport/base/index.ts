import { Outlet } from "../../outlet/types"
import { VerbaTransport } from "../types"
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createSimpleOutletLoggers } from "./simpleOutletLogger"
import { createStepOutputLogger } from "./step"
import { normalizeVerbaString } from "../../verbaString"
import { repeatStr } from "../../util/string"
import { useRef } from '../../util/misc'
import { BaseTransportOptions, TtyConsoleOccupier } from './types'

/**
 * Colors config object for the json-colorizer package for TTY consoles.
 * 
 * See below comment for `DEFAULT_FOREGROUND_JSON_COLORS` about why '1' is used.
 */
const TTY_JSON_COLORS = {
  STRING_KEY: '1', // Make string keys the default foreground color
  NULL_LITERAL: 'grey', // Make null literal values a bit faded
  NUMBER_LITERAL: 'yellow',
  STRING_LITERAL: 'green',
}

/**
 * Colors config object for the json-colorizer package that, due to
 * the package's rubbish way of doing options, is a workaround to enable
 * default foreground colors for text (that will work in light and dark themes).
 */
const DEFAULT_FOREGROUND_JSON_COLORS = {
  BOOLEAN_LITERAL: '1',
  BRACE: '1',
  BRACKET: '1',
  COLON: '1',
  COMMA: '1',
  NULL_LITERAL: '1',
  NUMBER_LITERAL: '1',
  STRING_KEY: '1',
  STRING_LITERAL: '1',
}

/**
 * A Verba Transport for typical console and file transports, supporting TTY and non-TTY terminals.
 */
export const baseTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(
  transportOptions: BaseTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => (loggerOptions, listeners) => {
  /**
   * The spinners, no matter the "nestedness" of a VerbaLogger, all share one console,
   * therefore we globally track the current spinner that is occupying the console.
   */
  const ttyConsoleOccupierRef = useRef<TtyConsoleOccupier | undefined>(undefined)

  // If a non-spinner log message is called while a spinner is active, temporarily
  // clear the currently active spinner from the console line in order to allow
  // the non-spinner log message to print to the console line. The spinner will
  // asynchronously print again later on.
  listeners.add('onBeforeLog', _options => {
    if (_options.outlet !== Outlet.STEP || !_options.options.spinner)
      ttyConsoleOccupierRef.current?.onInterruptedByOtherLog()
    else
      ttyConsoleOccupierRef.current?.destroy()
  })

  return nestState => {
    // For every logger and nested loggers thereof, pre-create simple outlet loggers that
    // bake-in some things like indentation and such for better performance and
    // reduced code-dupe.
    const simpleOutletLoggers = createSimpleOutletLoggers(transportOptions as any, loggerOptions as any, nestState)
    // eslint-disable-next-line max-len
    const stepLogger = createStepOutputLogger(transportOptions as any, transportOptions.isTty, nestState, simpleOutletLoggers.step, ttyConsoleOccupierRef)

    const jsonColors = (transportOptions.isTty && !(transportOptions?.disableColors ?? false)) ? TTY_JSON_COLORS : DEFAULT_FOREGROUND_JSON_COLORS

    return {
      log: _options => transportOptions.dispatch(normalizeVerbaString(_options.msg, transportOptions)),
      info: _options => simpleOutletLoggers.info(_options),
      step: _options => stepLogger(_options) as any,
      success: _options => simpleOutletLoggers.success(_options),
      warn: _options => simpleOutletLoggers.warn(_options),
      table: (data, _options) => transportOptions.dispatch(columify(data, _options)),
      json: (value, _options) => transportOptions.dispatch(colorizeJson(value, {
        pretty: _options?.pretty ?? false,
        colors: jsonColors,
      })),
      spacer: _options => transportOptions.dispatch(repeatStr('\n', _options.numLines - 1)),
      divider: () => transportOptions.dispatch(repeatStr('-', process.stdout.columns * 0.33)),
    }
  }
}
