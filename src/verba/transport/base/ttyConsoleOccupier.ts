import { OutletHandlerFnOptions, VerbaTransportEventHandlers } from "../types"

import { BaseTransportOptions } from "./types"
import { ListenerStore } from "../../util/listenerStore/types"
import { Outlet } from "../../outlet/types"
import { useRef } from "../../util/misc"

export type InterruptedTtyConsolerOccupier = {
  resume: () => void
}

/**
 * A type that represents an entity that is occupying the current (TTY) console output.
 * 
 * This could be a progress bar, a spinner, etc.
 */
export type TtyConsoleOccupier = {
  interrupt: () => void
  resume: () => void
  destroy: () => void
}

const isTerminalOccupier = (options: OutletHandlerFnOptions) => (
  options.outlet === Outlet.PROGRESS_BAR || (options.outlet === Outlet.STEP && options.options.spinner)
)

export const useTtyConsoleOccupierRef = (
  transportOptions: BaseTransportOptions,
  listeners:  ListenerStore<keyof VerbaTransportEventHandlers, VerbaTransportEventHandlers>,
) => {
  /**
   * The spinners, no matter the "nestedness" of a VerbaLogger, all share one console,
   * therefore we globally track the current spinner that is occupying the console.
   */
  const ttyConsoleOccupierRef = useRef<TtyConsoleOccupier | undefined>(undefined)
  if (transportOptions.isTty) {
    // If a non-spinner log message is called while a spinner is active, temporarily
    // clear the currently active spinner from the console line in order to allow
    // the non-spinner log message to print to the console line. The spinner will
    // asynchronously print again later on.
    listeners.add('onBeforeLog', _options => {
      if (isTerminalOccupier(_options))
        ttyConsoleOccupierRef.current?.destroy()
      else
        ttyConsoleOccupierRef.current?.interrupt()
    })

    listeners.add('onAfterLog', () => {
      ttyConsoleOccupierRef.current?.resume()
    })
  }

  return ttyConsoleOccupierRef
}
