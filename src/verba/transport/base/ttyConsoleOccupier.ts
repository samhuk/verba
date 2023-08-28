import { OutletHandlerFnOptions, VerbaTransportListenerStore } from "../types"

import { BaseTransportOptions } from "./types"
import { Outlet } from "../../outlet/types"
import { useRef } from "../../util/misc"

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

const determineIfLogMessageIsConsoleOccupying = (options: OutletHandlerFnOptions) => (
  options.outlet === Outlet.PROGRESS_BAR || options.outlet === Outlet.SPINNER
)

export const useTtyConsoleOccupierRef = (
  transportOptions: BaseTransportOptions,
  listeners: VerbaTransportListenerStore,
) => {
  /**
   * Anything that occupies the terminal console (i.e. spinners and loading bars)
   * all share one console regardless of the "nestedness" of the Verba instance
   * they are in.
   * 
   * Therefore, we will track the current occupier that is occupying the console
   * regardless of nestedness
   */
  const ttyConsoleOccupierRef = useRef<TtyConsoleOccupier | undefined>(undefined)

  // If the transport isn't TTY, then there is no support for animation behavior
  if (!transportOptions.isTty)
    return ttyConsoleOccupierRef

  // If a non-console-occupying log message is called while a console occupier
  // is active, then interrupt the current console occupier and resume after
  // the log.
  // Alternatively, if a console-occupying log message is called while a
  // console occupier is already active, then firstly this should not happen,
  // however if it indeed does, then the current one is destroyed and replaced
  // with the new occupier.
  listeners.add('onBeforeLog', logMessageOptions => {
    if (determineIfLogMessageIsConsoleOccupying(logMessageOptions))
      ttyConsoleOccupierRef.current?.destroy()
    else
      ttyConsoleOccupierRef.current?.interrupt()
  })

  listeners.add('onAfterLog', () => {
    ttyConsoleOccupierRef.current?.resume()
  })

  return ttyConsoleOccupierRef
}
