import { Outlet } from "../../outlet/types"
import { Spinner } from "../../spinner/types"
import { VerbaTransport } from "../types"
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createSimpleOutletLoggers } from "./simpleOutletLogger"
import { createStepOutputLogger } from "./step"
import { normalizeVerbaString } from "../../verbaString"
import { repeatStr } from "../../util/string"
import { useRef } from '../../util/misc'
import { ConsoleTransportOptions } from './types'

/**
 * Colors config object for the json-colorizer package for TTY consoles.
 * 
 * See below comment for `DEFAULT_FOREGROUND_JSON_COLORS` about why '1' is used.
 */
const TTY_JSON_COLORS = {
  STRING_KEY: '1', // Make string keys the default foreground color
  NULL_LITERAL: 'grey', // Make null literal values a bit lighter
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
 * A Verba Transport that outputs log messages to the Node.js `console.log`,
 * supporting TTY and non-TTY terminals.
 *
 * This is the default Transport that Verba uses if none are explicitly
 * defined.
 * 
 * @example
 * import verba, { consoleTransport } from 'verba'
 * // Explicit definition of console transport (this is default)
 * const log = verba({ transports: [consoleTransport()] })
 */
export const consoleTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(transportOptions?: ConsoleTransportOptions<TCode, TData>): VerbaTransport<TCode, TData> => (loggerOptions, listeners) => {
  const isTty = process.stdout.isTTY === true

  /**
   * The spinners, no matter the "nestedness" of a VerbaLogger, all share one console,
   * therefore we globally track the current spinner that is occupying the console.
   * This could be done better, i.e. abstracting to a generic console occupier
   * interface. For now, however, this will suffice.
   */
  const spinnerRef = useRef<Spinner | undefined>(undefined)

  // Before the log of any outlet apart from `step`, temporarily clear
  // the spinner from the console line, allowing the non-`step` call to
  // print to the console line before the spinner reprints it's frame.
  listeners.add('onBeforeLog', _options => {
    if (_options.outlet !== Outlet.STEP || !_options.options.spinner)
      spinnerRef.current?.temporarilyClear()
    else
      spinnerRef.current?.destroy()
  })

  return nestState => {
    // For every logger and nested loggers thereof, pre-create simple outlet loggers that
    // bake-in some things like indentation and such for better performance and
    // reduced code-dupe.
    const simpleOutletLoggers = createSimpleOutletLoggers(transportOptions as any, loggerOptions as any, nestState)
    const stepLogger = createStepOutputLogger(transportOptions as any, isTty, nestState, simpleOutletLoggers.step, spinnerRef)

    const jsonColors = (isTty && !(transportOptions?.disableColors ?? false)) ? TTY_JSON_COLORS : DEFAULT_FOREGROUND_JSON_COLORS

    return {
      log: _options => console.log(normalizeVerbaString(_options.msg)),
      info: _options => simpleOutletLoggers.info(_options),
      step: _options => stepLogger(_options) as any,
      success: _options => simpleOutletLoggers.success(_options),
      warn: _options => simpleOutletLoggers.warn(_options),
      table: (data, _options) => console.log(columify(data, _options)),
      json: (value, _options) => console.log(colorizeJson(value, {
        pretty: _options?.pretty ?? false,
        colors: jsonColors,
      })),
      spacer: _options => console.log(repeatStr('\n', _options.numLines - 1)),
      divider: () => console.log(repeatStr('-', process.stdout.columns * 0.33)),
    }
  }
}
