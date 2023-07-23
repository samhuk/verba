import { MutableRef } from "../../util/types"
import { NATIVE_OUTLETS } from "./nativeOutlets"
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
    const stepLogger = createStepOutputLogger(isTty, nestState, simpleOutletLoggers, spinnerRef)

    return {
      log: msg => NATIVE_OUTLETS.log(normalizeVerbaString(msg)),
      info: _options => simpleOutletLoggers.info(_options, nestState.indentationString),
      step: _options => stepLogger(_options) as any,
      success: _options => simpleOutletLoggers.success(_options, nestState.indentationString),
      warn: _options => simpleOutletLoggers.warn(_options, nestState.indentationString),
      table: (data, _options) => NATIVE_OUTLETS.log(columify(data, _options)),
      json: (value, _options) => NATIVE_OUTLETS.log(colorizeJson(value, {
        pretty: _options?.pretty ?? false,
      })),
      spacer: numLines => NATIVE_OUTLETS.log(repeatStr('\n', ((numLines ?? 1) - 1))),
      divider: () => NATIVE_OUTLETS.log(repeatStr('-', process.stdout.columns * 0.33)),
    }
  }
}
