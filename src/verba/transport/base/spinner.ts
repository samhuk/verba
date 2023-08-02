import { Spinner, SpinnerOptions } from '../../spinner/types'

import { createIndentationString } from '../../util/indentation'
import { normalizeVerbaString } from '../../verbaString'
import ora from 'ora-classic'

/**
 * Implementation of `Spinner` for the console. This supports TTY and non-TTY
 * consoles [0].
 * 
 * For non-TTY consoles, this will behave more like a simple step outlet
 * logger, returning a shim of a `Spinner`.
 * 
 * [0] Which is non-trivial since TTY consoles, by definition, allow
 * one to arbitrarily remove printed characters from the console, which is the
 * bedrock for all "terminal animation" behaviors such as loading spinners.
 */
export const createConsoleSpinner = (options?: SpinnerOptions): Spinner & { initialText: string } => {
  const initialText = normalizeVerbaString(options?.text ?? '', options)
  const spinner = ora({
    // We must subtract one because ora's prefixText doesn't seem to behave well.
    prefixText: options?.indentation != null ? createIndentationString(options.indentation - 1) : '',
    text: initialText,
    spinner: options?.spinner,
    color: options?.color,
  })

  if (!(options?.disableAutoStart ?? false))
    spinner.start()

  return {
    initialText,
    color: c => spinner.color = c,
    text: t => spinner.text = normalizeVerbaString(t, options),
    start: () => spinner.start(),
    pause: () => {
      spinner.stop()
      console.log(spinner.frame())
    },
    destroy: () => spinner.stop(),
    stopAndPersist: () => {
      spinner.stop()
      console.log(spinner.frame())
    },
  }
}
