import { Color } from 'ora-classic'
// eslint-disable-next-line import/no-extraneous-dependencies
import { SpinnerName } from 'cli-spinners'
import { VerbaString } from '../string/types'

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
}

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
   * Stops the spinner and clears the console line.
   */
  stop: () => void;
  /**
   * Stops the spinner, however leaves the current text of the spinner in the console line.
   */
  stopAndPersist: () => void;
}
