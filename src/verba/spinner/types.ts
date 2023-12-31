import { Color } from 'ora-classic'
import { SpinnerName } from 'cli-spinners'
import { VerbaString } from '../verbaString/types'

export type SpinnerOptions = {
  /**
   * The text of the spinner.
   */
  text?: VerbaString
  /**
   * The color of the spinner.
   */
  color?: Color
  /**
   * The type of spinner.
   */
  spinner?: SpinnerName
  /**
   * The indentation of the spinner.
   */
  indentation?: number
  /**
   * If `true`, does not start the spinner animation straight away, but instead
   * `spinner.start` must be called.
   * 
   * @default false
   */
  disableAutoStart?: boolean
  disableColors?: boolean
}

/**
 * Interface that wraps that of the `ora-classic` package (which is
 * quite bad).
 */
export type Spinner = {
  /**
   * Updates the text after the spinner.
   */
  text: (newText: VerbaString) => void
  /**
   * Updates the color of the spinner.
   */
  color: (color: Color) => void
  /**
   * Starts the spinner.
   */
  start: () => void;
  /**
   * Pauses the spinner.
   */
  pause: () => void;
  /**
   * Stops the spinner and clears the console line(s) it was occupying.
   */
  clear: () => void;
  /**
   * Stops the spinner however keeps the latest frame on the console line.
   */
  persist: () => void;
}
