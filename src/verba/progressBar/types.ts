export type ProgressBarProps = {
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
}

export type ProgressBar = {
  /**
   * Updates the value (out of the total).
   */
  update: (newValue: number) => void
  clear: () => void
  render: () => void
  destroy: () => void
  destroyAndPersist: () => void
}
