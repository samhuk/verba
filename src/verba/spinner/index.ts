import ora from 'ora-classic'
import { createIndentationString } from '../util/indentation'
import { normalizeVerbaString } from '../verbaString'
import { Spinner, SpinnerOptions } from './types'

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
export const createConsoleSpinner = (options?: SpinnerOptions & { renderPrefix: () => string }): Spinner => {
  const spinner = ora({
    // We must subtract one because ora's prefixText doesn't seem to behave well.
    prefixText: `${options?.renderPrefix?.() ?? ''}${options?.indentation != null ? createIndentationString(options.indentation - 1) : ''}`,
    text: normalizeVerbaString(options?.text ?? '', options),
    spinner: options?.spinner,
    color: options?.color,
  })

  if (!(options?.disableAutoStart ?? false))
    spinner.start()

  return {
    color: c => spinner.color = c,
    text: t => spinner.text = normalizeVerbaString(t, options),
    start: () => spinner.start(),
    pause: () => {
      spinner.stop()
      process.stdout.write(spinner.frame())
    },
    clear: () => spinner.stop(),
    persist: () => {
      spinner.stop()
      process.stdout.write(spinner.frame() + '\n')
    },
  }
}
