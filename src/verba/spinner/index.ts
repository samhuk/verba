import ora from 'ora-classic'
import { Spinner, SpinnerOptions } from './types'
import { normalizeVerbaString } from '../string'
import { createIndentationString } from '../util/indentation'

export const createSpinner = (options?: SpinnerOptions): Spinner => {
  const spinner = ora({
    // We must subtract one because ora's prefixText doesn't seem to behave well.
    prefixText: options?.indentation != null ? createIndentationString(options.indentation - 1) : '',
    text: normalizeVerbaString(options?.text ?? ''),
    spinner: options.spinner,
    color: options.color,
  })

  spinner.start()

  return {
    color: c => spinner.color = c,
    text: t => spinner.text = normalizeVerbaString(t),
    stop: () => spinner.stop(),
  }
}
