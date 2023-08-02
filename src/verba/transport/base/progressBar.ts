import { MutableRef } from "../../util/types"
import { NormalizedProgressBarOptions } from "../../outlet/types"
import { BaseTransportOptions, TtyConsoleOccupier } from "./types"
import { createConsoleProgressBar } from "../../progressBar"
import { NestState } from '../../types'
import { ProgressBar } from '../../progressBar/types'

export const createProgressBarLogger = (
  transportOptions: BaseTransportOptions,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  nestState: NestState,
  renderPrefix: () => string,
) => (
  options: NormalizedProgressBarOptions,
): ProgressBar => {
  // TODO: Until I figure out a way to nicely support progress bars in non-TTY envs, provide no-print shim
  if (!transportOptions.isTty) {
    return {
      update: (...args) => undefined,
      clear: (...args) => undefined,
      persist: (...args) => undefined,
      updateValue: (...args) => undefined,
      render: (...args) => undefined,
    }
  }

  const progressBar = createConsoleProgressBar({
    barLength: options.barLength,
    total: options.total,
    indentationString: nestState.indentationString,
    renderPrefix,
  })
  let isInterrupted = false

  ttyConsoleOccupierRef.current = {
    destroy: progressBar.clear,
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
