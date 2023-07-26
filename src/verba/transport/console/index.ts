import { MutableRef } from "../../util/types"
import { Outlet } from "../../types"
import { Spinner } from "../../spinner/types"
import { VerbaTransport } from "../types"
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createSimpleOutletLoggers } from "./simpleOutletLogger"
import { createStepOutputLogger } from "./step"
import { normalizeVerbaString } from "../../verbaString"
import { repeatStr } from "../../util/string"

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
 * A Verba Transport that outputs log messages to the Node.js `console`,
 * supporting TTY and non-TTY consoles.
 */
export const consoleTransport: VerbaTransport = (options, listeners) => {
  const isTty = process.stdout.isTTY === true

  /**
   * The spinners, no matter the "nestedness" of a VerbaLogger, all share one console,
   * therefore we globally track the current spinner that is occupying the console.
   * This could be done better, i.e. abstracting to a generic console occupier
   * interface. For now, however, this will suffice.
   */
  const spinnerRef: MutableRef<Spinner | undefined> = {
    current: undefined,
  }

  // Before the log of any outlet apart from `step`, temporarily clear
  // the spinner from the console line, allowing the non-`step` call to
  // print to the console line before the spinner reprints it's frame.
  listeners.add('onBeforeLog', _options => {
    if (_options.outlet !== Outlet.STEP)
      spinnerRef.current?.temporarilyClear()
  })

  return nestState => {
    // For every logger and nested loggers thereof, pre-create some loggers that
    // bake-in some things like indentation and such for better performance and
    // reduced code-dupe.
    const simpleOutletLoggers = createSimpleOutletLoggers(options, nestState.code)
    const stepLogger = createStepOutputLogger(isTty, nestState, simpleOutletLoggers.step, spinnerRef)

    return {
      log: _options => console.log(normalizeVerbaString(_options.msg)),
      info: _options => simpleOutletLoggers.info(_options, nestState.indentationString),
      step: _options => stepLogger(_options) as any,
      success: _options => simpleOutletLoggers.success(_options, nestState.indentationString),
      warn: _options => simpleOutletLoggers.warn(_options, nestState.indentationString),
      table: (data, _options) => console.log(columify(data, _options)),
      json: (value, _options) => console.log(colorizeJson(value, {
        pretty: _options?.pretty ?? false,
        colors: isTty ? TTY_JSON_COLORS : DEFAULT_FOREGROUND_JSON_COLORS,
      })),
      spacer: _options => console.log(repeatStr('\n', _options.numLines - 1)),
      divider: () => console.log(repeatStr('-', process.stdout.columns * 0.33)),
    }
  }
}
