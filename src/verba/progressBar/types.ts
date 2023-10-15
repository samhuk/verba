export type BuiltInProgressBarFormatName = 'default' | 'bar' | 'bar-braces' | 'blue-bar-on-white'

export type ProgressBarFormatOptions =  {
  /**
   * The number of characters that make up the progress bar.
   * 
   * @default 30
   */
  barLength?: number
  /**
   * Specifies the character used for the filled part of the bar.
   * 
   * ```plain
   * [###########         ] 50.00%
   *  ^^^^^^^^^^^
   * ```
   * 
   * @default "#"
   */
  filledBarCharacter?: string
  /**
   * Specifies the character used for the un-filled part of the bar.
   * 
   * ```plain
   * [###########         ] 50.00%
   *             ^^^^^^^^^
   * ```
   * 
   * @default " "
   */
  emptyBarCharacter?: string
  /**
   * Specifies the right-bordering character of the bar.
   * 
   * ```plain
   * [###########         ] 50.00%
   *                      ^
   * ```
   * 
   * @default "]"
   */
  rightBorderCharacter?: string
  /**
   * Specifies the left-bordering character of the bar.
   * 
   * ```plain
   * [###########         ] 50.00%
   * ^
   * ```
   * 
   * @default "["
   */
  leftBorderCharacter?: string
}

export type ProgressBarFormat = Required<ProgressBarFormatOptions>

export type ProgressBarOptions = {
  /**
   * The total.
   * 
   * @default 100
   */
  total?: number
  /**
   * Options to customize the appearance of the progress bar.
   * 
   * This may take different types of values:
   * * `default` - default format, like `[# ]`.
   * * `bar` - filled part of bar is white, un-filled part is half-shaded white.
   * * `blue-bar-on-white` - similar to `bar`, but filled part of the bar is blue and unfilled is white.
   * * `bar-braces` - similar to `bar`, but with square-braces at the ends of the bar and unfilled part of bar is empty.
   * * `{ ... }` - completely custom, allows for specifying the individual aspects of the format.
   */
  format?: ProgressBarFormatOptions | BuiltInProgressBarFormatName
  indentationString?: string
  renderPrefix?: () => void
}

export type ProgressBar = {
  /**
   * Updates the value (out of the total) of the progress bar and renders it to terminal.
   */
  update: (newValue: number) => void
  /**
   * Updates the value (out of the total) of the progress bar without rendering it to terminal.
   */
  updateValue: (newValue: number) => void
  /**
   * Clears the progress bar from the terminal.
   */
  clear: () => void
  /**
   * Renders the current state of the progress bar to the terminal.
   */
  render: () => void
  /**
   * Prints the current state of the progress bar to the terminal and adds a new line,
   * in effect persisting it forever to the terminal.
   */
  persist: () => void 
}
