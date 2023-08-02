import { ProgressBarOptions, ProgressBar } from './types'

export const createConsoleProgressBar = (props: ProgressBarOptions): ProgressBar => {
  let instance: ProgressBar
  let value = 0
  const barLength = props.barLength ?? 30
  const total = props.total ?? 100

  const frame = () => {
    const percentage = (value / total) * 100
    const numBarChars = Math.floor((percentage / 100) * barLength)
    return `${props.renderPrefix?.() ?? ''}[${"#".repeat(numBarChars)}${" ".repeat(barLength - numBarChars)}] ${percentage.toFixed(2)}%`
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
    update: newValue => {
      value = newValue
      render()
    },
    updateValue: newValue => value = newValue,
    clear,
    render,
    persist: () => {
      clear()
      process.stdout.write(frame() + '\n')
    },
  }
}
