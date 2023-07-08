import { Color } from 'ora'
// eslint-disable-next-line import/no-extraneous-dependencies
import { SpinnerName } from 'cli-spinners'
import { VerbaString } from '../string/types'

export type SpinnerOptions = {
  text: string
  color?: Color
  spinner: SpinnerName
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
