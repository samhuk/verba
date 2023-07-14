import { Spinner, SpinnerOptions } from './types'

import { NATIVE_OUTLETS } from '../nativeOutlets'
import { createIndentationString } from '../util/indentation'
import { normalizeVerbaString } from '../string'
import ora from 'ora-classic'

export const createSpinner = (options?: SpinnerOptions): Spinner => {
  const spinner = ora({
    // We must subtract one because ora's prefixText doesn't seem to behave well.
    prefixText: options?.indentation != null ? createIndentationString(options.indentation - 1) : '',
    text: normalizeVerbaString(options?.text ?? ''),
    spinner: options?.spinner,
    color: options?.color,
  })

  if (!(options?.disableAutoStart ?? false))
    spinner.start()

  return {
    color: c => spinner.color = c,
    text: t => spinner.text = normalizeVerbaString(t),
    start: () => spinner.start(),
    pause: () => {
      spinner.stop()
      NATIVE_OUTLETS.log(spinner.frame())
    },
    clear: () => {
      spinner.clear()
    },
    destroy: () => spinner.stop(),
    stopAndPersist: () => {
      spinner.stop()
      NATIVE_OUTLETS.log(spinner.frame())
    },
  }
}
