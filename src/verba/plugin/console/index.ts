import { MutableRef } from "../../util/types"
import { NATIVE_OUTLETS } from "./nativeOutlets"
import { Outlet } from "../../types"
import { Spinner } from "../../spinner/types"
import { VerbaPlugin } from "../types"
import colorizeJson from 'json-colorizer'
import columify from 'columnify'
import { createSimpleOutletLoggers } from "./simpleOutletLogger"
import { createStepOutputLogger } from "./step"
import { normalizeVerbaString } from "../../verbaString"
import { repeatStr } from "../../util/string"

export const consolePlugin: VerbaPlugin = (options, listeners) => {
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

  listeners.add('onBeforeLog', _options => {
    if (_options.outlet !== Outlet.STEP)
      spinnerRef.current?.temporarilyClear()
  })

  return nestState => {
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
