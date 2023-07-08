import { Color } from 'ora-classic'
// eslint-disable-next-line import/no-extraneous-dependencies
import { SpinnerName } from 'cli-spinners'
import { VerbaString } from '../string/types'

export type SpinnerOptions = {
  text?: VerbaString
  color?: Color
  spinner?: SpinnerName
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
   * Stop the spinner and clears the console line.
   */
  stop: () => void;
}
