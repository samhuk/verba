export type ProgressBarOptions = {
  /**
   * The total.
   * 
   * @default 100
   */
  total?: number
  /**
   * The number of characters that make up the progress bar.
   * 
   * @default 30
   */
  barLength?: number
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
