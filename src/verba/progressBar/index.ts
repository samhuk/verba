import { BuiltInProgressBarFormatName, ProgressBar, ProgressBarFormat, ProgressBarOptions } from './types'

import { renderStringWithFormats } from '../verbaString'

const BUILT_IN_FORMATS: Record<BuiltInProgressBarFormatName, ProgressBarFormat> = {
  default: {
    barLength: 30,
    emptyBarCharacter: ' ',
    filledBarCharacter: '#',
    leftBorderCharacter: '[',
    rightBorderCharacter: ']',
  },
  bar: {
    barLength: 30,
    emptyBarCharacter: '▒',
    filledBarCharacter: '█',
    leftBorderCharacter: '',
    rightBorderCharacter: '',
  },
  'bar-braces': {
    barLength: 30,
    emptyBarCharacter: ' ',
    filledBarCharacter: '█',
    leftBorderCharacter: '[',
    rightBorderCharacter: ']',
  },
  'blue-bar-on-white': {
    barLength: 30,
    emptyBarCharacter: '█',
    filledBarCharacter: renderStringWithFormats('█', ['blue']),
    leftBorderCharacter: '',
    rightBorderCharacter: '',
  },
}

const getFormat = (options: ProgressBarOptions): ProgressBarFormat => {
  if (typeof options.format === 'string')
    return BUILT_IN_FORMATS[options.format] ?? BUILT_IN_FORMATS.default

  return {
    barLength: options.format?.barLength ?? BUILT_IN_FORMATS.default.barLength,
    emptyBarCharacter: options.format?.emptyBarCharacter ?? BUILT_IN_FORMATS.default.emptyBarCharacter,
    filledBarCharacter: options.format?.filledBarCharacter ?? BUILT_IN_FORMATS.default.filledBarCharacter,
    leftBorderCharacter: options.format?.leftBorderCharacter ?? BUILT_IN_FORMATS.default.leftBorderCharacter,
    rightBorderCharacter: options.format?.rightBorderCharacter ?? BUILT_IN_FORMATS.default.rightBorderCharacter,
  }
}

export const createConsoleProgressBar = (options: ProgressBarOptions): ProgressBar => {
  let value = 0
  const total = options.total ?? 100

  const { barLength, emptyBarCharacter, filledBarCharacter, leftBorderCharacter, rightBorderCharacter } = getFormat(options)

  const frame = () => {
    const ratio = value / total
    const numBarChars = Math.floor(Math.min(1, ratio) * barLength)
    return `${options.renderPrefix?.() ?? ''}${leftBorderCharacter}${filledBarCharacter.repeat(numBarChars)}${emptyBarCharacter.repeat(barLength - numBarChars)}${rightBorderCharacter} ${(ratio * 100).toFixed(2)}%`
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
  
  return {
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
