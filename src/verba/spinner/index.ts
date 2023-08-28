import ora from 'ora-classic'
import { createIndentationString } from '../util/indentation'
import { normalizeVerbaString } from '../verbaString'
import { Spinner, SpinnerOptions } from './types'

const removeTrailingWhitespace = (str: string): string => {
  if (str.length === 0)
    return str

  const lastIndex = str.length - 1
  if (str[lastIndex] === ' ')
    return str.substring(0, lastIndex)

  return str.substring(0, str.length)
}

/**
 * Spinner implementation for a TTY console.
 */
export const createConsoleSpinner = (options?: SpinnerOptions & { renderPrefix: () => string }): Spinner => {
  const renderPrefixResult = options?.renderPrefix?.() ?? ''
  const prefixText = removeTrailingWhitespace(
    options?.indentation == null || options.indentation === 0
      ? renderPrefixResult
      : `${renderPrefixResult}${createIndentationString(options.indentation)}`,
  )
  const spinner = ora({
    prefixText,
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
