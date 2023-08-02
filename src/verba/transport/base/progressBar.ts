import { MutableRef } from "../../util/types"
import { NormalizedProgressBarOptions } from "../../outlet/types"
import { TtyConsoleOccupier } from "./types"
import { createConsoleProgressBar } from "../../progressBar"

export const createProgressBarLogger = (
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  ) => (_options: NormalizedProgressBarOptions)=> {
  const progressBar = createConsoleProgressBar(_options)
  let isInterrupted = false

  ttyConsoleOccupierRef.current = {
    destroy: progressBar.destroy,
    interrupt: () => {
      isInterrupted = true
      progressBar.clear()
    },
    resume: () => {
      if (isInterrupted) {
        progressBar.render()
        isInterrupted = false
      }
    },
  }

  return progressBar
}
