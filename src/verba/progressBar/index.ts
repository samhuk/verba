import { ProgressBarProps, ProgressBar } from './types'

export const createConsoleProgressBar = (props: ProgressBarProps): ProgressBar => {
  let instance: ProgressBar
  let value = 0
  const barLength = props.barLength ?? 30
  const total = props.total ?? 100

  const frame = () => {
    const percentage: number = (value / total) * 100
    const progressChars: number = Math.floor((percentage / 100) * barLength)
    return `[${"#".repeat(progressChars)}${" ".repeat(barLength - progressChars)}] ${percentage.toFixed(2)}%`
  }

  const clear = () => {
    // @ts-ignore
    process.stdout?.clearLine()
    process.stdout?.cursorTo(0)
  }

  const render = () => {
    clear()
    process.stdout.write('\r' + frame())
  }
  
  return instance = {
    update: progress => {
      value = progress
      render()
    },
    clear,
    render,
    destroy: () => {
      clear()
    },
    destroyAndPersist: () => {
      clear()
      process.stdout.write(frame() + '\n')
    },
  }
}
