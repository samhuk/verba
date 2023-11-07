import { BaseTransportOptions } from './types'
import { MutableRef } from '../../util/types'
import { NestState } from '../../types'
import { NormalizedProgressBarOptions } from '../../outlet/types'
import { ProgressBar } from '../../progressBar/types'
import { TtyConsoleOccupier } from './ttyConsoleOccupier'
import { createConsoleProgressBar } from '../../progressBar'

export const useProgressBarLogger = (
  transportOptions: BaseTransportOptions,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  nestState: NestState,
  renderDispatchTime: () => string,
  prefix: string | undefined,
) => (
  options: NormalizedProgressBarOptions,
): ProgressBar => {
  // TODO: Until I figure out a way to nicely support progress bars in non-TTY envs, provide no-print shim
  if (!transportOptions.isTty) {
    return {
      update: () => undefined,
      clear: () => undefined,
      persist: () => undefined,
      updateValue: () => undefined,
      render: () => undefined,
    }
  }

  const progressBar = createConsoleProgressBar({
    total: options.total,
    indentationString: nestState.indentationString,
    renderPrefix: () => `${prefix ?? ''}${renderDispatchTime()}`,
    format: options.format,
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
